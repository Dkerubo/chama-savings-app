from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError

user_bp = Blueprint('users', __name__, url_prefix='/api/users')


@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    try:
        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200
    except SQLAlchemyError:
        return jsonify({'error': 'Database error occurred.'}), 500


@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user = get_jwt_identity()
    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    try:
        user = User.query.get_or_404(user_id)
        return jsonify(user.serialize()), 200
    except SQLAlchemyError:
        return jsonify({'error': 'Database error occurred.'}), 500


@user_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    current_user = get_jwt_identity()
    if current_user['id'] != user_id and current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access.'}), 403

    data = request.get_json()
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
            'user': user.serialize()
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred.'}), 500


@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
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

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred.'}), 500
