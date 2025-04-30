from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from app.models.user import User
from app.extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Helper functions
def validate_required_fields(data, fields):
    """Validate presence of required fields"""
    missing = [field for field in fields if field not in data]
    if missing:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing
        }), 400
    return None

# Routes
@auth_bp.route('/register', methods=['POST'])
def register():
    # Validate input
    error_response = validate_required_fields(
        request.get_json(), 
        ['username', 'email', 'password']
    )
    if error_response:
        return error_response

    data = request.get_json()

    # Check for existing user
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 409

    # Create new user
    try:
        new_user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'member')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "Registration successful",
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    # Validate input
    error_response = validate_required_fields(
        request.get_json(),
        ['username', 'password']
    )
    if error_response:
        return error_response

    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    # Authenticate
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate token
    access_token = create_access_token(identity=user.get_jwt_identity())

    return jsonify({
        "access_token": access_token,
        "user": user.serialize()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.serialize()), 200