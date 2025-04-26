from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    
    # Only admins can list all users
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

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user = get_jwt_identity()
    
    # Users can only view their own profile unless they're admin
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

@user_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    
    # Users can only update their own profile unless they're admin
    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent changing role unless admin
        if 'role' in data and current_user['role'] != 'admin':
            return jsonify({'error': 'Only admins can change roles'}), 403
        
        if 'username' in data:
            # Check if username is already taken
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
        
        if 'email' in data:
            # Check if email is already taken
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

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    
    # Only admins can delete users, and cannot delete themselves
    if current_user['role'] != 'admin' or current_user['id'] == user_id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        user = User.query.get_or_404(user_id)
        
        # Check if user has any groups they admin
        if user.admin_groups:
            return jsonify({
                'error': 'Cannot delete user who is admin of groups. Transfer groups first.'
            }), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500