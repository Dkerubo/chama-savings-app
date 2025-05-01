from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models.user import User
from app.extensions import db
from werkzeug.exceptions import BadRequest
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    create_refresh_token,
    get_jwt,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models.user import User
from app.extensions import db
from werkzeug.exceptions import BadRequest
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_required_fields(data, fields):
    """Validate required fields in request data"""
    if data is None:
        return jsonify({"error": "Request body must be JSON"}), 400
    missing = [f for f in fields if f not in data or data.get(f) is None]
    if missing:
        return jsonify({"error": "Missing required fields", "missing": missing}), 400
    return None

def admin_required(fn):
    """Decorator for admin-only endpoints"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        if current_user.get('role') not in ['admin', 'superadmin']:
            return jsonify({"error": "Administrator access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    error = validate_required_fields(data, ['username', 'email', 'password'])
    if error:
        return error

    try:
        # Create user with validation
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            phone_number=data.get('phone_number'),
            role=data.get('role', 'member')
        )
        
        db.session.add(user)
        db.session.commit()

        # Create tokens
        access_token = create_access_token(identity=user.serialize())
        refresh_token = create_refresh_token(identity=user.serialize())
        
        response = jsonify({
            "message": "Registration successful",
            "user": user.serialize(),
            "access_token": access_token,
            "refresh_token": refresh_token
        })
        
        # Set cookies if needed
        if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
            set_access_cookies(response, access_token)
            set_refresh_cookies(response, refresh_token)
            
        return response, 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": "Validation failed", "details": str(e)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username or email already exists"}), 409
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT tokens"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    error = validate_required_fields(data, ['username', 'password'])
    if error:
        return error

    try:
        # Check if login is by username or email
        if '@' in data['username']:
            user = User.query.filter_by(email=data['username'].lower()).first()
        else:
            user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
            
        if not user.is_active:
            return jsonify({"error": "Account is inactive"}), 403

        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Create tokens
        access_token = create_access_token(identity=user.serialize())
        refresh_token = create_refresh_token(identity=user.serialize())
        
        response = jsonify({
            "message": "Login successful",
            "user": user.serialize(),
            "access_token": access_token,
            "refresh_token": refresh_token
        })
        
        # Set cookies if needed
        if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
            set_access_cookies(response, access_token)
            set_refresh_cookies(response, refresh_token)
            
        return response, 200

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user)
        
        response = jsonify({
            "access_token": new_token
        })
        
        if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
            set_access_cookies(response, new_token)
            
        return response, 200
    except Exception as e:
        return jsonify({"error": "Token refresh failed"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user and invalidate tokens"""
    try:
        response = jsonify({"message": "Logout successful"})
        
        if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
            unset_jwt_cookies(response)
            
        return response, 200
    except Exception as e:
        return jsonify({"error": "Logout failed"}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user's profile"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify(user.serialize()), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch user"}), 500