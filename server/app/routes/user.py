from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError

user_bp = Blueprint('users', __name__)

# Route to log in and get a JWT token
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = user.get_token()
    return jsonify({'access_token': access_token}), 200

# Route to get a list of all users (Admin only)
@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    try:
        users = User.query.all()
        return jsonify([{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        } for user in users]), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

# Route to get a specific user's information
@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user = get_jwt_identity()
    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

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

# Route to update user details
@user_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    current_user = get_jwt_identity()
    data = request.get_json()

    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    try:
        user = User.query.get_or_404(user_id)

        if 'role' in data and current_user['role'] != 'admin':
            return jsonify({'error': 'Only admins can change roles'}), 403

        if 'username' in data:
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']

        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already taken'}), 400
            user.email = data['email']

        if 'role' in data:
            user.role = data['role']

        if 'password' in data:
            user.set_password(data['password'])

        db.session.commit()

        return jsonify({
            'message': 'User updated successfully',
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

# Route to delete a user
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()

    if current_user['role'] != 'admin' or current_user['id'] == user_id:
        return jsonify({'error': 'Unauthorized access'}), 403

    try:
        user = User.query.get_or_404(user_id)

        if user.admin_groups and len(user.admin_groups) > 0:
            return jsonify({
                'error': 'Cannot delete user who is admin of groups. Transfer groups first.'
            }), 400

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
