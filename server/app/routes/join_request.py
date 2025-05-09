from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.join_request import JoinRequest
from app.models.user import User
from app.models.group import Group
from app.models.member import Member
from app.extensions import db
from datetime import datetime

join_request_bp = Blueprint('join_requests', __name__, url_prefix='/api/join-requests')

@join_request_bp.route('/', methods=['POST'])
@jwt_required()
def create_join_request():
    """Create a new join request to a group"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if not data or 'group_id' not in data:
        return jsonify({'error': 'Missing group_id'}), 400

    group_id = data['group_id']
    message = data.get('message')

    # Check if group exists
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    # Check if user is already a member
    existing_member = Member.query.filter_by(
        user_id=current_user_id,
        group_id=group_id
    ).first()
    if existing_member:
        return jsonify({'error': 'You are already a member of this group'}), 400

    # Check for existing pending request
    existing_request = JoinRequest.query.filter_by(
        user_id=current_user_id,
        group_id=group_id,
        status='pending'
    ).first()
    if existing_request:
        return jsonify({'error': 'You already have a pending request for this group'}), 400

    # Create new join request
    join_request = JoinRequest(
        user_id=current_user_id,
        group_id=group_id,
        message=message
    )

    db.session.add(join_request)
    db.session.commit()

    return jsonify(join_request.serialize()), 201

@join_request_bp.route('/', methods=['GET'])
@jwt_required()
def get_join_requests():
    """Get join requests (filterable by group or user)"""
    current_user_id = get_jwt_identity()
    group_id = request.args.get('group_id')
    user_id = request.args.get('user_id')
    status = request.args.get('status')

    query = JoinRequest.query

    # If requesting specific group's requests, verify admin status
    if group_id:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404

        # Only group admin can view their group's requests
        is_admin = Member.query.filter_by(
            user_id=current_user_id,
            group_id=group_id,
            role='admin'
        ).first()
        
        if not is_admin and str(current_user_id) != user_id:
            return jsonify({'error': 'Unauthorized to view these requests'}), 403

        query = query.filter_by(group_id=group_id)

    # Filter by user if specified
    if user_id:
        # Users can only see their own requests
        if str(current_user_id) != user_id:
            return jsonify({'error': 'Unauthorized to view these requests'}), 403
        query = query.filter_by(user_id=user_id)

    # Filter by status if specified
    if status:
        query = query.filter_by(status=status)

    join_requests = query.order_by(JoinRequest.created_at.desc()).all()
    return jsonify([jr.serialize() for jr in join_requests]), 200

@join_request_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_join_request(request_id):
    """Get a specific join request"""
    current_user_id = get_jwt_identity()
    join_request = JoinRequest.query.get_or_404(request_id)

    # Authorization check
    is_admin = Member.query.filter_by(
        user_id=current_user_id,
        group_id=join_request.group_id,
        role='admin'
    ).first()

    if str(current_user_id) not in [str(join_request.user_id), str(join_request.group.admin_id)] and not is_admin:
        return jsonify({'error': 'Unauthorized to view this request'}), 403

    return jsonify(join_request.serialize()), 200

@join_request_bp.route('/<int:request_id>/approve', methods=['PATCH'])
@jwt_required()
def approve_join_request(request_id):
    """Approve a join request (group admin only)"""
    current_user_id = get_jwt_identity()
    join_request = JoinRequest.query.get_or_404(request_id)

    # Verify the current user is admin of the group
    is_admin = Member.query.filter_by(
        user_id=current_user_id,
        group_id=join_request.group_id,
        role='admin'
    ).first()
    if not is_admin:
        return jsonify({'error': 'Only group admins can approve requests'}), 403

    if join_request.status != 'pending':
        return jsonify({'error': 'Request has already been processed'}), 400

    # Approve the request
    join_request.approve(current_user_id)

    # Add user to group as member
    new_member = Member(
        user_id=join_request.user_id,
        group_id=join_request.group_id,
        joined_at=datetime.utcnow(),
        status='active',
        role='member'
    )
    db.session.add(new_member)
    db.session.commit()

    return jsonify({
        'message': 'Join request approved',
        'join_request': join_request.serialize(),
        'member': new_member.serialize()
    }), 200

@join_request_bp.route('/<int:request_id>/reject', methods=['PATCH'])
@jwt_required()
def reject_join_request(request_id):
    """Reject a join request (group admin only)"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    reason = data.get('reason')
    
    join_request = JoinRequest.query.get_or_404(request_id)

    # Verify the current user is admin of the group
    is_admin = Member.query.filter_by(
        user_id=current_user_id,
        group_id=join_request.group_id,
        role='admin'
    ).first()
    if not is_admin:
        return jsonify({'error': 'Only group admins can reject requests'}), 403

    if join_request.status != 'pending':
        return jsonify({'error': 'Request has already been processed'}), 400

    # Reject the request
    join_request.reject(current_user_id, reason)
    db.session.commit()

    return jsonify({
        'message': 'Join request rejected',
        'join_request': join_request.serialize()
    }), 200

@join_request_bp.route('/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_join_request(request_id):
    """Delete a join request (owner or admin only)"""
    current_user_id = get_jwt_identity()
    join_request = JoinRequest.query.get_or_404(request_id)

    # Verify the current user is the requester or group admin
    is_admin = Member.query.filter_by(
        user_id=current_user_id,
        group_id=join_request.group_id,
        role='admin'
    ).first()

    if str(current_user_id) != str(join_request.user_id) and not is_admin:
        return jsonify({'error': 'Unauthorized to delete this request'}), 403

    db.session.delete(join_request)
    db.session.commit()

    return jsonify({'message': 'Join request deleted'}), 200