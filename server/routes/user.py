from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.extensions import db
from server.models.user import User

user_bp = Blueprint('user', __name__, url_prefix='/api/users')

# ========== Current Authenticated User ==========
@user_bp.route('/me', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_current_user():
    user_id = get_jwt_identity().get('id')
    user = User.query.get_or_404(user_id)

    if request.method == 'GET':
        return jsonify(user.serialize(include_sensitive=True)), 200

    elif request.method == 'PUT':
        data = request.get_json()
        user.username = data.get('username', user.username)
        user.phone_number = data.get('phone_number', user.phone_number)
        db.session.commit()
        return jsonify(user.serialize(include_sensitive=True)), 200

    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200


# ========== Admin View All Users ==========
@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        users = User.query.all()
        return jsonify({"users": [user.serialize() for user in users]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========== Admin Get One User ==========
@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    try:
        user = User.query.get_or_404(id)
        return jsonify(user.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========== Admin Create User ==========
@user_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    try:
        data = request.get_json()
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'member'),
            phone_number=data.get('phone_number')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# ========== Admin Update User ==========
@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    try:
        data = request.get_json()
        user = User.query.get_or_404(id)
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.phone_number = data.get('phone_number', user.phone_number)
        db.session.commit()
        return jsonify(user.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# ========== Admin Delete User ==========
@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    try:
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
