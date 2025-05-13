from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User

user_bp = Blueprint('user', __name__)

# ------------------------------------
# Authenticated User Endpoints (/me)
# ------------------------------------

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


# ------------------------------------
# Admin User Management Endpoints
# ------------------------------------

@user_bp.route('/', methods=['GET'])
def get_all_users():
    try:
        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    try:
        user = User.query.get_or_404(id)
        return jsonify(user.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'member')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@user_bp.route('/<int:id>', methods=['PUT'])
def update_user(id):
    try:
        data = request.get_json()
        user = User.query.get_or_404(id)
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        db.session.commit()
        return jsonify(user.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@user_bp.route('/<int:id>', methods=['DELETE'])
def delete_user(id):
    try:
        user = User.query.get_or_404(id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
