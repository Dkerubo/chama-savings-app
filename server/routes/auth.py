from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, unset_jwt_cookies
)
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from server.models.user import User
from server.extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# ========== Register ==========
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required = ['username', 'email', 'password']
    missing = [field for field in required if not data.get(field)]

    if missing:
        return jsonify({"error": "Missing fields", "missing": missing}), 400

    try:
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            phone_number=data.get('phone_number'),
            role=data.get('role', 'member')
        )
        db.session.add(user)
        db.session.commit()

        # Auto-login after registration
        user.last_login = datetime.utcnow()
        db.session.commit()

        access_token = create_access_token(identity=user.serialize())
        refresh_token = create_refresh_token(identity=user.serialize())

        return jsonify({
            "message": "Registration and login successful",
            "user": user.serialize(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Username or email already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "details": str(e)}), 500


# ========== Login ==========
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({"error": "Missing username or password"}), 400

        username_or_email = data['username']
        password = data['password']

        user = (User.query.filter_by(email=username_or_email.lower()).first()
                if '@' in username_or_email else
                User.query.filter_by(username=username_or_email).first())

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid credentials"}), 401

        if not user.is_active:
            return jsonify({"error": "Account inactive"}), 403

        user.last_login = datetime.utcnow()
        db.session.commit()

        access_token = create_access_token(identity=user.serialize())
        refresh_token = create_refresh_token(identity=user.serialize())

        return jsonify({
            "message": "Login successful",
            "user": user.serialize(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200

    except Exception as e:
        return jsonify({"error": "Login failed", "details": str(e)}), 500


# ========== Refresh ==========
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user)
        return jsonify({"access_token": new_token}), 200
    except Exception as e:
        return jsonify({"error": "Token refresh failed", "details": str(e)}), 500


# ========== Logout ==========
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        response = jsonify({"message": "Logout successful"})
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        return jsonify({"error": "Logout failed", "details": str(e)}), 500


# ========== Get Current User ==========
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.serialize()), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch user", "details": str(e)}), 500
