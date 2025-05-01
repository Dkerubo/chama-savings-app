from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.models.user import User
from app.extensions import db
from werkzeug.exceptions import BadRequest

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_required_fields(data, fields):
    """Validate required fields in request data"""
    if data is None:
        return jsonify({"error": "Request body must be JSON"}), 400
    missing = [f for f in fields if f not in data or data.get(f) is None]
    if missing:
        return jsonify({"error": "Missing required fields", "missing": missing}), 400
    return None

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
            password=data['password'],  # Will be hashed via set_password
            role=data.get('role', 'member')
        )
        
        # Additional explicit validation
        user.set_username(data['username'])
        user.set_email(data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()

        # Create token for immediate login after registration
        access_token = create_access_token(identity=user.get_jwt_identity())
        
        return jsonify({
            "message": "Registration successful",
            "access_token": access_token,
            "user": user.serialize()
        }), 201

    except ValueError as e:
        db.session.rollback()
        current_app.logger.error(f"Validation error during registration: {e}")
        return jsonify({
            "error": "Validation failed",
            "details": str(e)
        }), 400
        
    except IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"Integrity error during registration: {e}")
        return jsonify({
            "error": "Data conflict",
            "details": "Username or email already exists"
        }), 409
        
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error during registration: {e}")
        return jsonify({
            "error": "Database operation failed",
            "details": str(e)
        }), 500
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error during registration: {e}")
        return jsonify({
            "error": "Registration failed",
            "details": "Internal server error"
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    error = validate_required_fields(data, ['username', 'password'])
    if error:
        return error

    try:
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({"error": "Invalid username or password"}), 401
            
        if not user.is_active:
            return jsonify({"error": "Account is inactive"}), 403

        # Update last login
        user.update_last_login()
        db.session.commit()

        access_token = create_access_token(identity=user.get_jwt_identity())
        
        return jsonify({
            "access_token": access_token,
            "user": user.serialize(),
            "token_type": "bearer",
            "expires_in": current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }), 200

    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error during login: {e}")
        return jsonify({
            "error": "Authentication service unavailable",
            "details": str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user's profile"""
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity['id'])
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if not user.is_active:
            return jsonify({"error": "Account is inactive"}), 403

        return jsonify(user.serialize(include_sensitive=True)), 200
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error fetching user: {e}")
        return jsonify({
            "error": "Failed to retrieve user data",
            "details": str(e)
        }), 500