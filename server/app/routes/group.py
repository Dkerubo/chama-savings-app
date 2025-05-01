from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.group import Group
from app.models.member import Member
from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError

group_bp = Blueprint('group_bp', __name__)

# GET /api/groups - All groups (admin only)
@group_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_groups():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    groups = Group.query.all()
    return jsonify([group.serialize() for group in groups]), 200

# GET /api/my-groups - Groups current user created or is a member of
@group_bp.route('/my-groups', methods=['GET'])
@jwt_required()
def get_my_groups():
    current_user = get_jwt_identity()
    memberships = Member.query.filter_by(user_id=current_user['id']).all()

    group_data = []
    for membership in memberships:
        group = Group.query.get(membership.group_id)
        if group:
            group_data.append({
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'target_amount': group.target_amount,
                'current_amount': group.current_amount,
                'admin_id': group.admin_id,
                'is_public': group.is_public,
                'member_status': membership.status,
                'is_admin': membership.is_admin
            })

    return jsonify(group_data), 200

# POST /api/groups - Create group
@group_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    current_user = get_jwt_identity()
    data = request.get_json()

    if not data.get('name') or not data.get('target_amount'):
        return jsonify({'error': 'Missing required fields (name, target_amount)'}), 400

    if not isinstance(data['target_amount'], (int, float)) or data['target_amount'] <= 0:
        return jsonify({'error': 'target_amount must be a positive number'}), 400

    try:
        group = Group(
            name=data['name'],
            description=data.get('description', ''),
            target_amount=data['target_amount'],
            admin_id=current_user['id'],
            is_public=data.get('is_public', True)
        )
        db.session.add(group)
        db.session.commit()

        member = Member(
            user_id=current_user['id'],
            group_id=group.id,
            status='active',
            is_admin=True
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({'id': group.id, 'name': group.name, 'message': 'Group created successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# GET /api/groups/<id> - Get group by ID
@group_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify(group.serialize()), 200

# POST /api/groups/<id>/join - Join group
@group_bp.route('/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if Member.query.filter_by(user_id=current_user['id'], group_id=group_id).first():
        return jsonify({'error': 'Already a member of this group'}), 400

    try:
        member = Member(
            user_id=current_user['id'],
            group_id=group_id,
            status='active' if group.is_public else 'pending'
        )
        db.session.add(member)
        db.session.commit()
        message = 'Join request submitted' if not group.is_public else 'Successfully joined the group'
        return jsonify({'message': message}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# DELETE /api/groups/<id> - Delete group (if admin or creator)
@group_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    is_admin = current_user['role'] == 'admin'
    is_creator = group.admin_id == current_user['id']

    if not is_admin and not is_creator:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Group deleted successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
