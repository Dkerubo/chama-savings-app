import os
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
#from flasgger import Swagger

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///chama.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret')

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, supports_credentials=True)
    #Swagger(app)

    from models import User, Member, Group, Loan, Contribution
    register_routes(app)

    return app

def register_routes(app):
    from models import User, Member, Group, Loan, Contribution

    # Decorators
    def login_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({"error": "Authentication required"}), 401
            return f(*args, **kwargs)
        return decorated

    def admin_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = User.query.get(session.get('user_id'))
            if not user or user.role != "Admin":
                return jsonify({"error": "Admin access required"}), 403
            return f(*args, **kwargs)
        return decorated

    # Authentication Routes
    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already exists"}), 400
        hashed_pw = generate_password_hash(data['password'])
        user = User(username=data['username'], email=data['email'], password=hashed_pw, role=data.get('role', 'User'))
        db.session.add(user)
        db.session.commit()
        return jsonify(user.serialize()), 201

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and check_password_hash(user.password, data['password']):
            session['user_id'] = user.id
            return jsonify({"message": "Login successful", "user": user.serialize()}), 200
        return jsonify({"error": "Invalid credentials"}), 401

    @app.route('/logout', methods=['POST'])
    @login_required
    def logout():
        session.clear()
        return jsonify({"message": "Logged out"}), 200

    # User Routes
    @app.route('/users', methods=['GET'])
    @admin_required
    def get_users():
        users = User.query.all()
        return jsonify([u.serialize() for u in users]), 200

    @app.route('/users/<int:id>', methods=['GET'])
    @login_required
    def get_user(id):
        user = User.query.get_or_404(id)
        return jsonify(user.serialize()), 200

    # Member Routes
    @app.route('/members', methods=['GET'])
    @login_required
    def get_members():
        members = Member.query.all()
        return jsonify([m.serialize() for m in members]), 200

    @app.route('/members/<int:id>', methods=['GET'])
    @login_required
    def get_member(id):
        member = Member.query.get_or_404(id)
        return jsonify(member.serialize()), 200

    @app.route('/members', methods=['POST'])
    @admin_required
    def create_member():
        data = request.get_json()
        member = Member(name=data['name'], email=data['email'], phone=data['phone'])
        db.session.add(member)
        db.session.commit()
        return jsonify(member.serialize()), 201

    @app.route('/members/<int:id>', methods=['PUT'])
    @admin_required
    def update_member(id):
        member = Member.query.get_or_404(id)
        data = request.get_json()
        member.name = data.get('name', member.name)
        member.email = data.get('email', member.email)
        member.phone = data.get('phone', member.phone)
        db.session.commit()
        return jsonify(member.serialize()), 200

    @app.route('/members/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_member(id):
        member = Member.query.get_or_404(id)
        db.session.delete(member)
        db.session.commit()
        return jsonify({"message": "Member deleted"}), 200

    # Group Routes
    @app.route('/groups', methods=['GET'])
    @login_required
    def get_groups():
        groups = Group.query.all()
        return jsonify([g.serialize() for g in groups]), 200

    @app.route('/groups/<int:id>', methods=['GET'])
    @login_required
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

    # Loan Routes
    @app.route('/loans', methods=['GET'])
    @login_required
    def get_loans():
        loans = Loan.query.all()
        return jsonify([l.serialize() for l in loans]), 200

    @app.route('/loans/<int:id>', methods=['GET'])
    @login_required
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

    # Contribution Routes
    @app.route('/contributions', methods=['GET'])
    @login_required
    def get_contributions():
        contributions = Contribution.query.all()
        return jsonify([c.serialize() for c in contributions]), 200

    @app.route('/contributions/<int:id>', methods=['GET'])
    @login_required
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

    @app.route('/contributions/<int:id>', methods=['PUT'])
    @admin_required
    def update_contribution(id):
        contribution = Contribution.query.get_or_404(id)
        data = request.get_json()
        contribution.amount = data.get('amount', contribution.amount)
        if 'date' in data:
            contribution.date = datetime.strptime(data['date'], '%Y-%m-%d')
        db.session.commit()
        return jsonify(contribution.serialize()), 200

    @app.route('/contributions/<int:id>', methods=['DELETE'])
    @admin_required
    def delete_contribution(id):
        contribution = Contribution.query.get_or_404(id)
        db.session.delete(contribution)
        db.session.commit()
        return jsonify({"message": "Contribution deleted"}), 200

# Dashboards
@app.route('/dashboard/loans', methods=['GET'])
@admin_required
def loan_dashboard():
    total_loans = db.session.query(db.func.sum(Loan.amount)).scalar() or 0
    total_loans_count = Loan.query.count()
    active_loans = Loan.query.filter_by(status="active").count()
    return jsonify({
        "total_loans": total_loans,
        "total_loans_count": total_loans_count,
        "active_loans": active_loans
    }), 200

@app.route('/dashboard/contributions', methods=['GET'])
@admin_required
def contribution_dashboard():
    total_contributions = db.session.query(db.func.sum(Contribution.amount)).scalar() or 0
    total_contributions_count = Contribution.query.count()
    recent_contributions = Contribution.query.order_by(Contribution.date.desc()).limit(5).all()
    return jsonify({
        "total_contributions": total_contributions,
        "total_contributions_count": total_contributions_count,
        "recent_contributions": [c.serialize() for c in recent_contributions]
    }), 200
    
# Run the application
if __name__ == '__main__':
    app = create_app()
    app.run(port=5555, debug=True)
    
