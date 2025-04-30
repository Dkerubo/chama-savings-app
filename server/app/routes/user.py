from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError

user_bp = Blueprint('users', __name__)

# ------------------------
# Authentication Endpoints
# ------------------------

@user_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT access token."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password.'}), 401

    access_token = user.get_token()
    return jsonify({'access_token': access_token}), 200


@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    try:
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# ------------------------
# User Management Endpoints
# ------------------------

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """Get a list of all users (admin only)."""
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    try:
        users = User.query.all()
        user_list = [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        } for user in users]
        return jsonify(user_list), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get specific user information."""
    current_user = get_jwt_identity()
    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    try:
        user = User.query.get_or_404(user_id)
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    """Update user details (self or admin)."""
    current_user = get_jwt_identity()
    data = request.get_json()

    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    try:
        user = User.query.get_or_404(user_id)

        if 'role' in data and current_user['role'] != 'admin':
            return jsonify({'error': 'Only admins can change roles.'}), 403

        if 'username' in data:
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Username already taken.'}), 400
            user.username = data['username']

        if 'email' in data:
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Email already taken.'}), 400
            user.email = data['email']

        if 'role' in data:
            user.role = data['role']

        if 'password' in data:
            user.set_password(data['password'])

        db.session.commit()
        return jsonify({
            'message': 'User updated successfully.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user (admin only, cannot delete self)."""
    current_user = get_jwt_identity()

    if current_user['role'] != 'admin' or current_user['id'] == user_id:
        return jsonify({'error': 'Unauthorized access.'}), 403

    try:
        user = User.query.get_or_404(user_id)

        if getattr(user, 'admin_groups', None) and len(user.admin_groups) > 0:
            return jsonify({
                'error': 'Cannot delete user who is admin of groups. Transfer ownership first.'
            }), 400

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully.'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
