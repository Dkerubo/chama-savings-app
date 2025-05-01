from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from werkzeug.exceptions import BadRequest

user_bp = Blueprint('users', __name__, url_prefix='/api/users')

def admin_required():
    """Decorator factory for admin-only endpoints"""
    def decorator(f):
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user = get_jwt_identity()
            if current_user['role'] not in ['admin', 'superadmin']:
                return jsonify({'error': 'Administrator access required.'}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

@user_bp.route('/', methods=['GET'])
@admin_required()
def get_users():
    """Get all users (admin only)"""
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
        return jsonify({'error': 'Database error occurred.', 'details': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get specific user (admin or self)"""
    current_user = get_jwt_identity()
    
    try:
        user = User.query.get_or_404(user_id)
        
        # Allow access if admin or requesting own data
        if current_user['id'] != user_id and current_user['role'] not in ['admin', 'superadmin']:
            return jsonify({'error': 'Unauthorized access.'}), 403
            
        return jsonify(user.serialize(
            include_sensitive=current_user['role'] in ['admin', 'superadmin']
        )), 200
        
    except SQLAlchemyError as e:
        return jsonify({'error': 'Database error occurred.', 'details': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['PATCH', 'PUT'])
@jwt_required()
def update_user(user_id):
    """Update user profile (admin or self with restrictions)"""
    current_user = get_jwt_identity()
    
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
        
    try:
        data = request.get_json()
        user = User.query.get_or_404(user_id)
        
        # Authorization check
        if current_user['id'] != user_id and current_user['role'] not in ['admin', 'superadmin']:
            return jsonify({'error': 'Unauthorized access.'}), 403
            
        # Role changes restricted to admins
        if 'role' in data and current_user['role'] not in ['admin', 'superadmin']:
            return jsonify({'error': 'Only administrators can change roles.'}), 403
            
        # Prevent privilege escalation
        if 'role' in data and current_user['role'] != 'superadmin' and data['role'] == 'superadmin':
            return jsonify({'error': 'Only superadmin can assign superadmin role.'}), 403

        # Update fields with validation
        if 'username' in data:
            user.set_username(data['username'])
            
        if 'email' in data:
            user.set_email(data['email'])
            
        if 'password' in data:
            user.set_password(data['password'])
            
        if 'role' in data:
            user.set_role(data['role'])
            
        # Update optional fields
        optional_fields = ['phone_number', 'profile_picture', 'is_active']
        for field in optional_fields:
            if field in data:
                setattr(user, field, data[field])

        db.session.commit()
        return jsonify({
            'message': 'User updated successfully.',
            'user': user.serialize()
        }), 200
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': 'Validation error', 'details': str(e)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Database integrity error (possibly duplicate data)'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred.', 'details': str(e)}), 500
    except BadRequest:
        return jsonify({'error': 'Invalid JSON data'}), 400

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    """Delete user account (admin only, with safeguards)"""
    current_user = get_jwt_identity()
    
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent self-deletion
        if current_user['id'] == user_id:
            return jsonify({'error': 'Cannot delete your own account.'}), 403
            
        # Check for admin dependencies
        if user.admin_groups and len(user.admin_groups) > 0:
            return jsonify({
                'error': 'Cannot delete user who administers groups.',
                'groups': [group.id for group in user.admin_groups]
            }), 400
            
        # Check for other important relationships
        if user.members and len(user.members) > 0:
            return jsonify({
                'error': 'Cannot delete user with active group memberships.',
                'memberships': [m.group_id for m in user.members]
            }), 400

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully.'}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred.', 'details': str(e)}), 500

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    """Get profile of currently authenticated user"""
    current_user = get_jwt_identity()
    return get_user(current_user['id'])