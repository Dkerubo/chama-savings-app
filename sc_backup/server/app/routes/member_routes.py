from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

member_bp = Blueprint('member_bp', __name__)

# Create a new member
@member_bp.route('/members', methods=['POST'])
def add_member():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    group_id = data.get('group_id')
    phone = data.get('phone')
    address = data.get('address')

    if not user_id or not group_id:
        return jsonify({"error": "Missing user_id or group_id"}), 400

    user = User.query.get(user_id)
    if not user or user.role != 'member':
        return jsonify({"error": "Invalid user or user is not a member"}), 400

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "Group not found"}), 404

    # Prevent duplicate membership
    if Member.query.filter_by(user_id=user_id, group_id=group_id).first():
        return jsonify({"error": "User is already a member of this group"}), 409

    # Check if the group has reached its maximum member count
    current_members_count = Member.query.filter_by(group_id=group_id).count()
    if current_members_count >= 30:
        return jsonify({"error": "Group has reached maximum capacity (30 members)"}), 403

    # Assign admin if this is the first member
    is_admin = (current_members_count == 0)

    member = Member(user_id=user_id, group_id=group_id, is_admin=is_admin,
                    phone=phone, address=address)
    db.session.add(member)
    db.session.commit()

    return jsonify({
        "message": "Member added",
        "member": member.serialize()
    }), 201


# Read all members
@member_bp.route('/members', methods=['GET'])
def get_members():
    members = Member.query.all()
    return jsonify([m.serialize() for m in members]), 200


# Read a single member by member ID
@member_bp.route('/members/<int:id>', methods=['GET'])
def get_member(id):
    member = Member.query.get(id)
    if not member:
        return jsonify({"error": "Member not found"}), 404
    return jsonify(member.serialize()), 200


# Read a member by user ID
@member_bp.route('/members/user/<int:user_id>', methods=['GET'])
def get_member_by_user(user_id):
    member = Member.query.filter_by(user_id=user_id).first()
    if not member:
        return jsonify({"error": "Member not found"}), 404
    return jsonify(member.serialize()), 200


# Update a member’s details
@member_bp.route('/members/<int:id>', methods=['PUT'])
def update_member(id):
    member = Member.query.get(id)
    if not member:
        return jsonify({"error": "Member not found"}), 404

    data = request.get_json() or {}
    group_id = data.get('group_id')
    phone = data.get('phone')
    address = data.get('address')

    if group_id and group_id != member.group_id:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({"error": "New group not found"}), 404
        if Member.query.filter_by(user_id=member.user_id, group_id=group_id).first():
            return jsonify({"error": "User is already a member of the new group"}), 409
        member.group_id = group_id

    if phone is not None:
        member.phone = phone
    if address is not None:
        member.address = address

    db.session.commit()
    return jsonify({
        "message": "Member updated",
        "member": member.serialize()
    }), 200


# Delete a member
@member_bp.route('/members/<int:id>', methods=['DELETE'])
def delete_member(id):
    member = Member.query.get(id)
    if not member:
        return jsonify({"error": "Member not found"}), 404

    # Prevent deletion if it results in group having less than 4 members
    group_members_count = Member.query.filter_by(group_id=member.group_id).count()
    if group_members_count <= 4:
        return jsonify({"error": "Cannot remove member. Group must have at least 4 members."}), 403

    db.session.delete(member)
    db.session.commit()
    return jsonify({"message": "Member removed"}), 200
