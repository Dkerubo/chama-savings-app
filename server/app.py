import os
from datetime import datetime
from functools import wraps
from werkzeug.exceptions import BadRequest, Unauthorized, Forbidden, NotFound
from dotenv import load_dotenv
import bcrypt

# Flask core
from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from flask_restful import Api
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.base import AdminIndexView

# Database
from database import db
from models import User, Member, Group, Loan, Contribution, Investment, LoanRepayment

# Load environment variables
load_dotenv()

# Initialize Flask extensions
csrf = CSRFProtect()
migrate = Migrate()
cors = CORS()
admin = Admin(name='Admin Panel', template_mode='bootstrap3')

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///chama.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour session lifetime

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    cors.init_app(app, supports_credentials=True, resources={
        r"/*": {
            "origins": os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000')
        }
    })
    
    # Configure admin panel
    admin.init_app(app, index_view=AdminIndexView(
        url='/admin',
        template='admin/index.html',
        name='Dashboard'
    ))

    # Customized admin views
    class SecureModelView(ModelView):
        def is_accessible(self):
            if 'user_id' not in session:
                return False
            user = User.query.get(session['user_id'])
            return user and user.role == 'Admin'

        def inaccessible_callback(self, name, **kwargs):
            return make_response(jsonify({'error': 'Unauthorized'}), 403)

    # Add models to admin panel with custom view
    admin.add_view(SecureModelView(User, db.session))
    admin.add_view(SecureModelView(Member, db.session))
    admin.add_view(SecureModelView(Group, db.session))
    admin.add_view(SecureModelView(Loan, db.session))
    admin.add_view(SecureModelView(Contribution, db.session))
    admin.add_view(SecureModelView(Investment, db.session))
    admin.add_view(SecureModelView(LoanRepayment, db.session))

    # Create API instance
    api = Api(app)

    # Register routes and error handlers
    register_routes(app)
    register_error_handlers(app)

    # CLI commands
    register_commands(app)

    return app

# Authentication and authorization decorators
def login_required(roles=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                raise Unauthorized("Authentication required")
            user = User.query.get(session['user_id'])
            if not user or not user.is_active:
                raise Unauthorized("Invalid user")
            if roles and user.role not in roles:
                raise Forbidden("Insufficient permissions")
            return f(*args, **kwargs)
        return decorated_function
    return decorator

admin_required = login_required(roles=['Admin'])
treasurer_required = login_required(roles=['Admin', 'Treasurer'])

# Utility functions
def paginate(query):
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    return query.paginate(page=page, per_page=per_page, error_out=False)

def validate_json_data(required_fields):
    data = request.get_json()
    if not data:
        raise BadRequest("No JSON data provided")
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        raise BadRequest(f"Missing required fields: {', '.join(missing_fields)}")
    return data

# Route registration
def register_routes(app):
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy'}), 200

    # Authentication routes
    @app.route('/auth/register', methods=['POST'])
    def register():
        data = validate_json_data(['username', 'email', 'password'])
        
        if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
            raise BadRequest("Username or email already exists")
        
        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'Member'),
            is_active=True
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.serialize()
        }), 201

    @app.route('/auth/login', methods=['POST'])
    def login():
        data = validate_json_data(['username', 'password'])
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            raise Unauthorized("Invalid credentials")
        if not user.is_active:
            raise Unauthorized("Account is inactive")
            
        session['user_id'] = user.id
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'user': user.serialize()
        }), 200

    @app.route('/auth/logout', methods=['POST'])
    @login_required()
    def logout():
        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200

    # User management routes
    @app.route('/users/me', methods=['GET'])
    @login_required()
    def get_current_user():
        user = User.query.get(session['user_id'])
        return jsonify(user.serialize()), 200

    @app.route('/users/<int:id>', methods=['GET'])
    @admin_required
    def get_user(id):
        user = User.query.get_or_404(id)
        return jsonify(user.serialize()), 200

    @app.route('/users/<int:id>', methods=['PUT'])
    @login_required()
    def update_user(id):
        # Users can update their own profile, admins can update any
        if id != session['user_id'] and User.query.get(session['user_id']).role != 'Admin':
            raise Forbidden("You can only update your own profile")
            
        user = User.query.get_or_404(id)
        data = request.get_json()
        
        if 'username' in data and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                raise BadRequest("Username already taken")
            user.username = data['username']
            
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                raise BadRequest("Email already in use")
            user.email = data['email']
            
        if 'password' in data:
            user.set_password(data['password'])
            
        db.session.commit()
        return jsonify(user.serialize()), 200

    # Member routes
    @app.route('/members', methods=['GET'])
    @login_required()
    def get_members():
        query = Member.query
        if 'group_id' in request.args:
            query = query.filter_by(group_id=request.args['group_id'])
        if 'status' in request.args:
            query = query.filter_by(status=request.args['status'])
            
        pagination = paginate(query)
        return jsonify({
            'items': [m.serialize() for m in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    @app.route('/members/<int:id>', methods=['GET'])
    @login_required()
    def get_member(id):
        member = Member.query.get_or_404(id)
        return jsonify(member.serialize()), 200

    @app.route('/members', methods=['POST'])
    @admin_required
    def create_member():
        data = validate_json_data(['name', 'group_id'])
        
        member = Member(
            name=data['name'],
            status=data.get('status', 'Active'),
            group_id=data['group_id'],
            joined_date=data.get('joined_date', datetime.utcnow())
        )
        db.session.add(member)
        db.session.commit()
        return jsonify(member.serialize()), 201

    @app.route('/members/<int:id>', methods=['PUT'])
    @admin_required
    def update_member(id):
        member = Member.query.get_or_404(id)
        data = request.get_json()
        
        member.name = data.get('name', member.name)
        member.status = data.get('status', member.status)
        member.group_id = data.get('group_id', member.group_id)
        
        db.session.commit()
        return jsonify(member.serialize()), 200

    @app.route('/members/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_member(id):
        member = Member.query.get_or_404(id)
        db.session.delete(member)
        db.session.commit()
        return jsonify({'message': 'Member deleted successfully'}), 200

    # Group routes
    @app.route('/groups', methods=['GET'])
    @login_required()
    def get_groups():
        query = Group.query
        if 'name' in request.args:
            query = query.filter(Group.name.ilike(f"%{request.args['name']}%"))
            
        pagination = paginate(query)
        return jsonify({
            'items': [g.serialize() for g in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    @app.route('/groups/<int:id>', methods=['GET'])
    @login_required()
    def get_group(id):
        group = Group.query.get_or_404(id)
        return jsonify(group.serialize(with_members=True)), 200

    @app.route('/groups', methods=['POST'])
    @admin_required
    def create_group():
        data = validate_json_data(['name'])
        
        group = Group(
            name=data['name'],
            description=data.get('description', ''),
            created_at=datetime.utcnow()
        )
        db.session.add(group)
        db.session.commit()
        return jsonify(group.serialize()), 201

    @app.route('/groups/<int:id>', methods=['PUT'])
    @admin_required
    def update_group(id):
        group = Group.query.get_or_404(id)
        data = request.get_json()
        
        group.name = data.get('name', group.name)
        group.description = data.get('description', group.description)
        
        db.session.commit()
        return jsonify(group.serialize()), 200

    @app.route('/groups/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_group(id):
        group = Group.query.get_or_404(id)
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Group deleted successfully'}), 200

    # Loan routes
    @app.route('/loans', methods=['GET'])
    @login_required()
    def get_loans():
        query = Loan.query
        if 'member_id' in request.args:
            query = query.filter_by(member_id=request.args['member_id'])
        if 'status' in request.args:
            query = query.filter_by(status=request.args['status'])
            
        pagination = paginate(query)
        return jsonify({
            'items': [loan.serialize() for loan in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    @app.route('/loans/<int:id>', methods=['GET'])
    @login_required()
    def get_loan(id):
        loan = Loan.query.get_or_404(id)
        return jsonify(loan.serialize(with_repayments=True)), 200

    @app.route('/loans', methods=['POST'])
    @treasurer_required
    def create_loan():
        data = validate_json_data(['member_id', 'amount', 'due_date'])
        
        loan = Loan(
            member_id=data['member_id'],
            amount=data['amount'],
            interest_rate=data.get('interest_rate', 0.1),
            status='Active',
            issue_date=datetime.utcnow(),
            due_date=datetime.strptime(data['due_date'], "%Y-%m-%d"),
            purpose=data.get('purpose', '')
        )
        db.session.add(loan)
        db.session.commit()
        return jsonify(loan.serialize()), 201

    @app.route('/loans/<int:id>', methods=['PUT'])
    @treasurer_required
    def update_loan(id):
        loan = Loan.query.get_or_404(id)
        data = request.get_json()
        
        loan.amount = data.get('amount', loan.amount)
        loan.interest_rate = data.get('interest_rate', loan.interest_rate)
        loan.status = data.get('status', loan.status)
        if 'due_date' in data:
            loan.due_date = datetime.strptime(data['due_date'], "%Y-%m-%d")
        loan.purpose = data.get('purpose', loan.purpose)
        
        db.session.commit()
        return jsonify(loan.serialize()), 200

    @app.route('/loans/<int:id>/approve', methods=['POST'])
    @admin_required
    def approve_loan(id):
        loan = Loan.query.get_or_404(id)
        loan.status = 'Approved'
        loan.approval_date = datetime.utcnow()
        db.session.commit()
        return jsonify(loan.serialize()), 200

    @app.route('/loans/<int:id>/reject', methods=['POST'])
    @admin_required
    def reject_loan(id):
        loan = Loan.query.get_or_404(id)
        loan.status = 'Rejected'
        db.session.commit()
        return jsonify(loan.serialize()), 200

    @app.route('/loans/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_loan(id):
        loan = Loan.query.get_or_404(id)
        db.session.delete(loan)
        db.session.commit()
        return jsonify({'message': 'Loan deleted successfully'}), 200

    # Contribution routes
    @app.route('/contributions', methods=['GET'])
    @login_required()
    def get_contributions():
        query = Contribution.query
        if 'member_id' in request.args:
            query = query.filter_by(member_id=request.args['member_id'])
        if 'group_id' in request.args:
            query = query.join(Member).filter(Member.group_id == request.args['group_id'])
            
        pagination = paginate(query)
        return jsonify({
            'items': [c.serialize() for c in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    @app.route('/contributions/<int:id>', methods=['GET'])
    @login_required()
    def get_contribution(id):
        contribution = Contribution.query.get_or_404(id)
        return jsonify(contribution.serialize()), 200

    @app.route('/contributions', methods=['POST'])
    @treasurer_required
    def create_contribution():
        data = validate_json_data(['member_id', 'amount'])
        
        contribution = Contribution(
            member_id=data['member_id'],
            amount=data['amount'],
            date=data.get('date', datetime.utcnow()),
            payment_method=data.get('payment_method', 'Cash'),
            receipt_number=data.get('receipt_number', '')
        )
        db.session.add(contribution)
        db.session.commit()
        return jsonify(contribution.serialize()), 201

    @app.route('/contributions/<int:id>', methods=['PUT'])
    @treasurer_required
    def update_contribution(id):
        contribution = Contribution.query.get_or_404(id)
        data = request.get_json()
        
        contribution.amount = data.get('amount', contribution.amount)
        if 'date' in data:
            contribution.date = datetime.strptime(data['date'], "%Y-%m-%d")
        contribution.payment_method = data.get('payment_method', contribution.payment_method)
        contribution.receipt_number = data.get('receipt_number', contribution.receipt_number)
        
        db.session.commit()
        return jsonify(contribution.serialize()), 200

    @app.route('/contributions/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_contribution(id):
        contribution = Contribution.query.get_or_404(id)
        db.session.delete(contribution)
        db.session.commit()
        return jsonify({'message': 'Contribution deleted successfully'}), 200

    # Investment routes
    @app.route('/investments', methods=['GET'])
    @login_required()
    def get_investments():
        query = Investment.query
        if 'status' in request.args:
            query = query.filter_by(status=request.args['status'])
            
        pagination = paginate(query)
        return jsonify({
            'items': [i.serialize() for i in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    @app.route('/investments/<int:id>', methods=['GET'])
    @login_required()
    def get_investment(id):
        investment = Investment.query.get_or_404(id)
        return jsonify(investment.serialize()), 200

    @app.route('/investments', methods=['POST'])
    @treasurer_required
    def create_investment():
        data = validate_json_data(['name', 'amount'])
        
        investment = Investment(
            name=data['name'],
            amount=data['amount'],
            date=data.get('date', datetime.utcnow()),
            status='Active',
            expected_return=data.get('expected_return', 0),
            maturity_date=data.get('maturity_date'),
            description=data.get('description', '')
        )
        db.session.add(investment)
        db.session.commit()
        return jsonify(investment.serialize()), 201

    @app.route('/investments/<int:id>', methods=['PUT'])
    @treasurer_required
    def update_investment(id):
        investment = Investment.query.get_or_404(id)
        data = request.get_json()
        
        investment.name = data.get('name', investment.name)
        investment.amount = data.get('amount', investment.amount)
        investment.status = data.get('status', investment.status)
        investment.expected_return = data.get('expected_return', investment.expected_return)
        if 'maturity_date' in data:
            investment.maturity_date = datetime.strptime(data['maturity_date'], "%Y-%m-%d")
        investment.description = data.get('description', investment.description)
        
        db.session.commit()
        return jsonify(investment.serialize()), 200

    @app.route('/investments/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_investment(id):
        investment = Investment.query.get_or_404(id)
        db.session.delete(investment)
        db.session.commit()
        return jsonify({'message': 'Investment deleted successfully'}), 200

    # Loan repayment routes
    @app.route('/repayments', methods=['GET'])
    @login_required()
    def get_repayments():
        query = LoanRepayment.query
        if 'loan_id' in request.args:
            query = query.filter_by(loan_id=request.args['loan_id'])
            
        pagination = paginate(query)
        return jsonify({
            'items': [r.serialize() for r in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    @app.route('/repayments/<int:id>', methods=['GET'])
    @login_required()
    def get_repayment(id):
        repayment = LoanRepayment.query.get_or_404(id)
        return jsonify(repayment.serialize()), 200

    @app.route('/repayments', methods=['POST'])
    @treasurer_required
    def create_repayment():
        data = validate_json_data(['loan_id', 'amount'])
        
        repayment = LoanRepayment(
            loan_id=data['loan_id'],
            amount=data['amount'],
            date=data.get('date', datetime.utcnow()),
            payment_method=data.get('payment_method', 'Cash'),
            receipt_number=data.get('receipt_number', '')
        )
        
        # Update loan balance
        loan = Loan.query.get_or_404(data['loan_id'])
        loan.paid_amount = (loan.paid_amount or 0) + data['amount']
        if loan.paid_amount >= loan.amount:
            loan.status = 'Paid'
            
        db.session.add(repayment)
        db.session.commit()
        return jsonify(repayment.serialize()), 201

    @app.route('/repayments/<int:id>', methods=['PUT'])
    @treasurer_required
    def update_repayment(id):
        repayment = LoanRepayment.query.get_or_404(id)
        data = request.get_json()
        
        # Calculate difference if amount changes
        old_amount = repayment.amount
        repayment.amount = data.get('amount', repayment.amount)
        if 'date' in data:
            repayment.date = datetime.strptime(data['date'], "%Y-%m-%d")
        repayment.payment_method = data.get('payment_method', repayment.payment_method)
        repayment.receipt_number = data.get('receipt_number', repayment.receipt_number)
        
        # Update loan balance if amount changed
        if old_amount != repayment.amount:
            loan = repayment.loan
            loan.paid_amount = (loan.paid_amount or 0) - old_amount + repayment.amount
            if loan.paid_amount >= loan.amount:
                loan.status = 'Paid'
            else:
                loan.status = 'Active'
                
        db.session.commit()
        return jsonify(repayment.serialize()), 200

    @app.route('/repayments/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_repayment(id):
        repayment = LoanRepayment.query.get_or_404(id)
        
        # Update loan balance
        loan = repayment.loan
        loan.paid_amount = (loan.paid_amount or 0) - repayment.amount
        if loan.paid_amount < loan.amount:
            loan.status = 'Active'
            
        db.session.delete(repayment)
        db.session.commit()
        return jsonify({'message': 'Repayment deleted successfully'}), 200

    # Reports routes
    @app.route('/reports/summary', methods=['GET'])
    @treasurer_required
    def get_summary_report():
        total_members = Member.query.count()
        total_groups = Group.query.count()
        total_loans = Loan.query.filter_by(status='Active').count()
        total_contributions = db.session.query(db.func.sum(Contribution.amount)).scalar() or 0
        total_investments = db.session.query(db.func.sum(Investment.amount)).scalar() or 0
        
        return jsonify({
            'total_members': total_members,
            'total_groups': total_groups,
            'active_loans': total_loans,
            'total_contributions': float(total_contributions),
            'total_investments': float(total_investments)
        }), 200

    @app.route('/reports/group/<int:group_id>', methods=['GET'])
    @login_required()
    def get_group_report(group_id):
        group = Group.query.get_or_404(group_id)
        
        # Group contributions
        contributions = db.session.query(
            db.func.sum(Contribution.amount).label('total')
        ).join(Member).filter(Member.group_id == group_id).scalar() or 0
        
        # Group loans
        loans = Loan.query.join(Member).filter(Member.group_id == group_id).all()
        total_loans = sum(loan.amount for loan in loans)
        active_loans = sum(loan.amount for loan in loans if loan.status == 'Active')
        
        return jsonify({
            'group': group.serialize(),
            'total_contributions': float(contributions),
            'total_loans': float(total_loans),
            'active_loans': float(active_loans),
            'member_count': group.members.count()
        }), 200

# Error handlers
def register_error_handlers(app):
    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({
            'error': 'Bad Request',
            'message': str(e) if str(e) else 'Invalid request data'
        }), 400

    @app.errorhandler(401)
    def handle_unauthorized(e):
        return jsonify({
            'error': 'Unauthorized',
            'message': str(e) if str(e) else 'Authentication required'
        }), 401

    @app.errorhandler(403)
    def handle_forbidden(e):
        return jsonify({
            'error': 'Forbidden',
            'message': str(e) if str(e) else 'Insufficient permissions'
        }), 403

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            'error': 'Not Found',
            'message': str(e) if str(e) else 'Resource not found'
        }), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({
            'error': 'Method Not Allowed',
            'message': str(e) if str(e) else 'The method is not allowed for the requested URL'
        }), 405

    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        return jsonify({
            'error': 'Unprocessable Entity',
            'message': str(e) if str(e) else 'Request was well-formed but contains semantic errors'
        }), 422

    @app.errorhandler(500)
    def handle_internal_server_error(e):
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e) if str(e) else 'An internal server error occurred'
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        app.logger.error(f'Unhandled exception: {str(e)}')
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500

# CLI commands
def register_commands(app):
    @app.cli.command('initdb')
    def init_db():
        """Initialize the database."""
        db.create_all()
        print('Database initialized.')

    @app.cli.command('seed')
    def seed_db():
        """Seed the database with sample data."""
        from faker import Faker
        import random
        
        fake = Faker()
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@chama.com',
            role='Admin',
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create some groups
        groups = []
        for _ in range(5):
            group = Group(
                name=fake.company(),
                description=fake.catch_phrase()
            )
            groups.append(group)
            db.session.add(group)
        
        db.session.commit()
        
        # Create members for each group
        for group in groups:
            for _ in range(random.randint(5, 15)):
                member = Member(
                    name=fake.name(),
                    status='Active',
                    group_id=group.id,
                    joined_date=fake.date_between(start_date='-2y', end_date='today')
                )
                db.session.add(member)
        
        db.session.commit()
        print('Database seeded with sample data.')

# Run the application
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5555, debug=True)