from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import datetime
from flask import current_app

auth_bp = Blueprint('auth', __name__)

def generate_token(user):
    token = jwt.encode({
        'id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")
    return token

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Username already exists"}), 409

    user = User(
        username=data['username'],
        role=data.get('role', 'member')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        token = generate_token(user)
        return jsonify({"token": token, "role": user.role, "user_id": user.id}), 200
    return jsonify({"message": "Invalid credentials"}), 401
