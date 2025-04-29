from flask import Blueprint, request, jsonify
from app.models.group import Group
from app.models.member import Member
from app.models.user import User
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

group_bp = Blueprint('groups', __name__)

@group_bp.route('/', methods=['GET'])
def get_groups():
    public_groups = Group.query.filter_by(is_public=True).all()
    return jsonify([{
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'target_amount': group.target_amount,
        'current_amount': group.current_amount,
        'admin_id': group.admin_id
    } for group in public_groups]), 200

@group_bp.route('/my-groups', methods=['GET'])
@jwt_required()
def get_my_groups():
    current_user = get_jwt_identity()
    memberships = Member.query.filter_by(user_id=current_user['id']).all()
    
    groups = []
    for membership in memberships:
        group = Group.query.get(membership.group_id)
        user = User.query.get(membership.user_id)  # Fetch user info to include in the response
        groups.append({
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'target_amount': group.target_amount,
            'current_amount': group.current_amount,
            'admin_id': group.admin_id,
            'member_status': membership.status,
            'is_admin': membership.is_admin,
            'user_full_name': f"{user.first_name} {user.last_name}"  # Add user's full name
        })
    
    return jsonify(groups), 200

@group_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    current_user = get_jwt_identity()
    data = request.get_json()
    
    # Validate input data
    if 'name' not in data or 'target_amount' not in data:
        return jsonify({'error': 'Missing required fields (name, target_amount)'}), 400
    
    if not isinstance(data['target_amount'], (int, float)) or data['target_amount'] <= 0:
        return jsonify({'error': 'target_amount must be a positive number'}), 400

    group = Group(
        name=data['name'],
        description=data.get('description', ''),
        target_amount=data['target_amount'],
        admin_id=current_user['id'],
        is_public=data.get('is_public', True)
    )
    
    db.session.add(group)
    db.session.commit()
    
    # Add creator as admin member
    member = Member(
        user_id=current_user['id'],
        group_id=group.id,
        status='active',
        is_admin=True
    )
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        'id': group.id,
        'name': group.name,
        'message': 'Group created successfully'
    }), 201

@group_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'target_amount': group.target_amount,
        'current_amount': group.current_amount,
        'admin_id': group.admin_id,
        'is_public': group.is_public
    }), 200

@group_bp.route('/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)
    
    # Check if already a member
    existing_member = Member.query.filter_by(
        user_id=current_user['id'],
        group_id=group_id
    ).first()
    
    if existing_member:
        return jsonify({'error': 'You are already a member of this group'}), 400
    
    member = Member(
        user_id=current_user['id'],
        group_id=group_id,
        status='active' if group.is_public else 'pending'
    )
    
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        'message': 'Join request submitted successfully' if not group.is_public 
                   else 'You have joined the group successfully'
    }), 201
