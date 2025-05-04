from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

user_bp = Blueprint('users', __name__, url_prefix='/api/users')

# -----------------------
# Role-based Decorators
# -----------------------

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user = get_jwt_identity()
        if user['role'] not in ['admin', 'superadmin']:
            return jsonify({'error': 'Admin access required.'}), 403
        return f(*args, **kwargs)
    return decorated

def superadmin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user = get_jwt_identity()
        if user['role'] != 'superadmin':
            return jsonify({'error': 'Superadmin access required.'}), 403
        return f(*args, **kwargs)
    return decorated

# -----------------------
# User CRUD Routes
# -----------------------

@user_bp.route('/', methods=['GET'])
@admin_required
def get_all_users():
    """List all users (paginated)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        users = User.query.paginate(page=page, per_page=per_page, error_out=False)
        return jsonify({
            'users': [user.serialize() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': users.page
        }), 200
    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error', 'details': str(e)}), 500


@user_bp.route('/create', methods=['POST'])
@admin_required
def create_user():
    """Create a new user (admin/superadmin only)"""
    data = request.get_json()
    try:
        user = User(
            username=data['username'],
            email=data['email'],
            phone_number=data.get('phone_number'),
            profile_picture=data.get('profile_picture'),
            role=data.get('role', 'member')
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User created', 'user': user.serialize()}), 201
    except (KeyError, ValueError) as e:
        return jsonify({'error': 'Invalid input', 'details': str(e)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'User with given email or username already exists'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_single_user(user_id):
    """Get user by ID (admin/superadmin or self only)"""
    current_user = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if current_user['id'] != user_id and current_user['role'] not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized access'}), 403

    return jsonify(user.serialize(include_sensitive=current_user['role'] in ['admin', 'superadmin'])), 200


@user_bp.route('/<int:user_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_user_profile(user_id):
    """Update a user (admin/superadmin or self only)"""
    current_user = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if current_user['id'] != user_id and current_user['role'] not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    try:
        if 'username' in data:
            user.set_username(data['username'])
        if 'email' in data:
            user.set_email(data['email'])
        if 'password' in data:
            user.set_password(data['password'])
        if 'role' in data:
            if current_user['role'] != 'superadmin':
                return jsonify({'error': 'Only superadmin can change roles.'}), 403
            user.set_role(data['role'])
        for field in ['phone_number', 'profile_picture', 'is_active']:
            if field in data:
                setattr(user, field, data[field])
        db.session.commit()
        return jsonify({'message': 'User updated', 'user': user.serialize()}), 200
    except (ValueError, IntegrityError) as e:
        db.session.rollback()
        return jsonify({'error': 'Validation error', 'details': str(e)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500


@user_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user_account(user_id):
    """Delete a user (admin/superadmin only)"""
    current_user = get_jwt_identity()
    if current_user['id'] == user_id:
        return jsonify({'error': 'You cannot delete your own account.'}), 403

    user = User.query.get_or_404(user_id)

    if user.admin_groups:
        return jsonify({'error': 'User is admin of groups.', 'groups': [g.id for g in user.admin_groups]}), 400
    if user.members:
        return jsonify({'error': 'User has group memberships.', 'groups': [m.group_id for m in user.members]}), 400

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted.'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500


@user_bp.route('/<int:user_id>/role', methods=['PATCH'])
@superadmin_required
def promote_user(user_id):
    """Change a user's role (superadmin only)"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    new_role = data.get('role')

    if new_role not in ['member', 'admin', 'superadmin']:
        return jsonify({'error': 'Invalid role'}), 400

    try:
        user.set_role(new_role)
        db.session.commit()
        return jsonify({'message': 'User role updated', 'user': user.serialize()}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500

# -----------------------
# Logged-in User Routes
# -----------------------

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    """Get current logged-in user's profile"""
    current_user = get_jwt_identity()
    user = User.query.get_or_404(current_user['id'])
    return jsonify(user.serialize(include_sensitive=True)), 200


@user_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_my_profile():
    """Update logged-in user's profile"""
    current_user = get_jwt_identity()
    user = User.query.get_or_404(current_user['id'])
    data = request.get_json()

    try:
        if 'email' in data:
            user.set_email(data['email'])
        if 'username' in data:
            user.set_username(data['username'])
        if 'password' in data:
            user.set_password(data['password'])
        for field in ['phone_number', 'profile_picture']:
            if field in data:
                setattr(user, field, data[field])
        db.session.commit()
        return jsonify({'message': 'Profile updated', 'user': user.serialize()}), 200
    except (ValueError, IntegrityError) as e:
        db.session.rollback()
        return jsonify({'error': 'Validation error', 'details': str(e)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500


@user_bp.route('/admin-profile', methods=['PUT'])
@admin_required
def update_admin_profile():
    """Update admin's own profile (convenience route)"""
    current_user = get_jwt_identity()
    user = User.query.get_or_404(current_user['id'])
    data = request.get_json()

    try:
        for field in ['username', 'email', 'phone_number', 'profile_picture']:
            if field in data:
                setattr(user, field, data[field])
        db.session.commit()
        return jsonify({'message': 'Admin profile updated', 'user': user.serialize()}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500
