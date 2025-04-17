import os
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from werkzeug.exceptions import BadRequest, Unauthorized, Forbidden
from dotenv import load_dotenv

from config import config  # Make sure this is a dictionary in config.py
from database import db, init_db
from models import User, Member, Group, Loan, Contribution, Investment

# Load environment variables
load_dotenv()

# Initialize extensions
csrf = CSRFProtect()
migrate = Migrate()
cors = CORS()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # Initialize extensions
    init_db(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    cors.init_app(app, supports_credentials=True)

    # Register routes and error handlers
    register_routes(app)
    register_error_handlers(app)

    return app

# --------------------------
# Utility Functions & Decorators
# --------------------------

def login_required(roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                raise Unauthorized("Authentication required")

            user = User.query.get(session['user_id'])
            if not user or not user.is_active:
                raise Unauthorized("Invalid user")

            if roles and user.role not in roles:
                raise Forbidden("Insufficient permissions")

            return f(*args, **kwargs)
        return decorated
    return decorator

admin_required = login_required(roles=['Admin'])

def paginate(query):
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    return query.paginate(page=page, per_page=per_page, error_out=False)

# --------------------------
# Routes
# --------------------------

def register_routes(app):

    # --- AUTH ---
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        required_fields = ['username', 'email', 'password']
        if not all(field in data for field in required_fields):
            raise BadRequest("Missing required fields")

        if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
            raise BadRequest("Username or email already exists")

        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'Member')
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()

        return jsonify(user.serialize()), 201

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data.get('username')).first()

        if not user or not user.check_password(data.get('password', '')):
            raise Unauthorized("Invalid credentials")

        session['user_id'] = user.id
        user.last_login = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Login successful",
            "user": user.serialize()
        }), 200

    @app.route('/api/auth/logout', methods=['POST'])
    @login_required()
    def logout():
        session.clear()
        return jsonify({"message": "Logged out"}), 200

    # --- USERS ---
    @app.route('/api/users/me', methods=['GET'])
    @login_required()
    def get_current_user():
        user = User.query.get(session['user_id'])
        return jsonify(user.serialize()), 200

    @app.route('/api/users/<int:id>', methods=['GET'])
    @admin_required
    def get_user(id):
        user = User.query.get_or_404(id)
        return jsonify(user.serialize()), 200

    # --- MEMBERS ---
    @app.route('/api/members', methods=['GET'])
    @login_required()
    def get_members():
        query = Member.query
        if request.args.get('active'):
            query = query.filter_by(status='Active')
        pagination = paginate(query)
        return jsonify({
            'items': [m.serialize() for m in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': pagination.page
        }), 200

    # --- GROUPS ---
    @app.route('/groups', methods=['GET'])
    @login_required()
    def get_groups():
        groups = Group.query.all()
        return jsonify([g.serialize() for g in groups]), 200

    @app.route('/groups/<int:id>', methods=['GET'])
    @login_required()
    def get_group(id):
        group = Group.query.get_or_404(id)
        return jsonify(group.serialize()), 200

    @app.route('/groups', methods=['POST'])
    @admin_required
    def create_group():
        data = request.get_json()
        group = Group(name=data['name'], description=data.get('description'))
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
        return jsonify({"message": "Group deleted"}), 200

    # --- LOANS ---
    @app.route('/loans', methods=['GET'])
    @login_required()
    def get_loans():
        loans = Loan.query.all()
        return jsonify([l.serialize() for l in loans]), 200

    @app.route('/loans/<int:id>', methods=['GET'])
    @login_required()
    def get_loan(id):
        loan = Loan.query.get_or_404(id)
        return jsonify(loan.serialize()), 200

    @app.route('/loans', methods=['POST'])
    @admin_required
    def create_loan():
        data = request.get_json()
        loan = Loan(
            member_id=data['member_id'],
            amount=data['amount'],
            interest_rate=data['interest_rate'],
            term=data['term'],
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d')
        )
        db.session.add(loan)
        db.session.commit()
        return jsonify(loan.serialize()), 201

    @app.route('/loans/<int:id>', methods=['PUT'])
    @admin_required
    def update_loan(id):
        loan = Loan.query.get_or_404(id)
        data = request.get_json()
        loan.amount = data.get('amount', loan.amount)
        loan.interest_rate = data.get('interest_rate', loan.interest_rate)
        loan.term = data.get('term', loan.term)
        if 'due_date' in data:
            loan.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        db.session.commit()
        return jsonify(loan.serialize()), 200

    @app.route('/loans/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_loan(id):
        loan = Loan.query.get_or_404(id)
        db.session.delete(loan)
        db.session.commit()
        return jsonify({"message": "Loan deleted"}), 200

    # --- CONTRIBUTIONS ---
    @app.route('/contributions', methods=['GET'])
    @login_required()
    def get_contributions():
        contributions = Contribution.query.all()
        return jsonify([c.serialize() for c in contributions]), 200

    @app.route('/contributions/<int:id>', methods=['GET'])
    @login_required()
    def get_contribution(id):
        contribution = Contribution.query.get_or_404(id)
        return jsonify(contribution.serialize()), 200

    @app.route('/contributions', methods=['POST'])
    @admin_required
    def add_contribution():
        data = request.get_json()
        contribution = Contribution(
            member_id=data['member_id'],
            amount=data['amount'],
            date=datetime.strptime(data['date'], '%Y-%m-%d')
        )
        db.session.add(contribution)
        db.session.commit()
        return jsonify(contribution.serialize()), 201

# --------------------------
# Error Handlers
# --------------------------

def register_error_handlers(app):
    @app.errorhandler(BadRequest)
    def handle_bad_request(e):
        return jsonify({"error": str(e)}), 400

    @app.errorhandler(Unauthorized)
    def handle_unauthorized(e):
        return jsonify({"error": str(e)}), 401

    @app.errorhandler(Forbidden)
    def handle_forbidden(e):
        return jsonify({"error": str(e)}), 403

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def handle_server_error(e):
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app = create_app()
    app.run(port=5555, debug=True)
