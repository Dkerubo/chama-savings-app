from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Import models (after db initialization)
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
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Unauthorized. Please log in."}), 401

        user = User.query.get(user_id)
        if not user or user.role != "Admin":
            return jsonify({"error": "Forbidden. Admin access required."}), 403

        return f(*args, **kwargs)
    return decorated

def admin_or_treasurer_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'role' not in session or session['role'] not in ['Admin', 'Treasurer']:
            return jsonify({"error": "Admin or Treasurer access required"}), 403
        return f(*args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Member')

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists."}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists."}), 409

    try:
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully."}), 201

    except Exception:
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the user."}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password."}), 401

    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role
    session['member_id'] = user.member_id

    return jsonify({
        "message": "Login successful.",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "member_id": user.member_id
        }
    }), 200

@app.route('/logout', methods=['POST'])
def logout():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in."}), 401

    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200

# Member Routes
@app.route('/members', methods=['GET'])
@admin_required
def get_all_members():
    members = Member.query.all()
    return jsonify([m.to_dict() for m in members]), 200

@app.route('/members/<int:id>', methods=['GET'])
@login_required
def get_member_by_id(id):
    member = Member.query.get(id)
    if not member:
        return jsonify({"error": "Member not found."}), 404

    # Only allow access if admin or the member themselves
    if session['role'] != 'Admin' and session['member_id'] != id:
        return jsonify({"error": "Unauthorized access."}), 403

    return jsonify(member.to_dict()), 200

@app.route('/members', methods=['POST'])
@admin_required
def create_member():
    data = request.get_json()
    required_fields = ['name', 'email', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    if Member.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists."}), 409

    new_member = Member(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        joined_date=datetime.utcnow(),
        status='Active'
    )

    db.session.add(new_member)
    db.session.commit()

    return jsonify(new_member.to_dict()), 201

# Group Routes
@app.route('/groups', methods=['GET'])
@login_required
def get_all_groups():
    groups = Group.query.all()
    return jsonify([g.to_dict() for g in groups]), 200

@app.route('/groups/<int:id>', methods=['GET'])
@login_required
def get_group_by_id(id):
    group = Group.query.get(id)
    if not group:
        return jsonify({"error": "Group not found."}), 404
    return jsonify(group.to_dict()), 200

# Loan Routes
@app.route('/loans', methods=['GET'])
@login_required
def get_all_loans():
    if session['role'] == 'Admin':
        loans = Loan.query.all()
    else:
        loans = Loan.query.filter_by(member_id=session['member_id']).all()
    return jsonify([l.to_dict() for l in loans]), 200

@app.route('/loans/<int:id>', methods=['GET'])
@login_required
def get_loan_by_id(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({"error": "Loan not found."}), 404

    # Only admin or loan owner can view
    if session['role'] != 'Admin' and loan.member_id != session['member_id']:
        return jsonify({"error": "Unauthorized access."}), 403

    return jsonify(loan.to_dict()), 200

# Contribution Routes
@app.route('/contributions', methods=['GET'])
@login_required
def get_all_contributions():
    if session['role'] == 'Admin':
        contributions = Contribution.query.all()
    else:
        contributions = Contribution.query.filter_by(member_id=session['member_id']).all()
    return jsonify([c.to_dict() for c in contributions]), 200

@app.route('/contributions', methods=['POST'])
@login_required
def create_contribution():
    data = request.get_json()
    required_fields = ['amount', 'group_id']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Members can only contribute for themselves
    if session['role'] == 'Member':
        data['member_id'] = session['member_id']

    new_contribution = Contribution(
        amount=data['amount'],
        date=datetime.utcnow(),
        payment_method=data.get('payment_method', 'M-Pesa'),
        member_id=data['member_id'],
        group_id=data['group_id']
    )

    db.session.add(new_contribution)
    db.session.commit()

    return jsonify(new_contribution.to_dict()), 201

# Run App
if __name__ == '__main__':
    app.run(port=5555, debug=True)