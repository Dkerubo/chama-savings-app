from flask import Blueprint, request, jsonify
from app.extensions import db
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

    # Check group size
    current_members_count = Member.query.filter_by(group_id=group_id).count()
    if current_members_count >= 30:
        return jsonify({"error": "Group has reached maximum capacity (30 members)"}), 403

    # Assign admin if first member
    is_admin = (current_members_count == 0)

    member = Member(user_id=user_id, group_id=group_id, is_admin=is_admin,
                    phone=phone, address=address)
    db.session.add(member)
    db.session.commit()

    return jsonify({
        "message": "Member added successfully",
        "member": member.serialize()
    }), 201

# Get all members
@member_bp.route('/members', methods=['GET'])
def get_members():
    members = Member.query.all()
    return jsonify([m.serialize() for m in members]), 200

# Get a specific member
@member_bp.route('/members/<int:member_id>', methods=['GET'])
def get_member(member_id):
    member = Member.query.get_or_404(member_id)
    return jsonify(member.serialize()), 200

# Delete a member
@member_bp.route('/members/<int:member_id>', methods=['DELETE'])
def delete_member(member_id):
    member = Member.query.get_or_404(member_id)
    db.session.delete(member)
    db.session.commit()
    return jsonify({"message": f"Member {member_id} deleted successfully."}), 200
