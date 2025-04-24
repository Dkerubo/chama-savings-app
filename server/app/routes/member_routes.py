from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

member_bp = Blueprint('member_bp', __name__)

@member_bp.route('/members', methods=['POST'])
def add_member():
    data = request.json
    user_id = data.get('user_id')
    group_id = data.get('group_id')

    user = User.query.get(user_id)
    group = Group.query.get(group_id)

    if not user or user.role != 'member':
        return jsonify({"message": "Invalid user"}), 400
    if not group:
        return jsonify({"message": "Invalid group"}), 400

    member = Member(user_id=user_id, group_id=group_id)
    db.session.add(member)
    db.session.commit()

    return jsonify({"message": "Member added", "member": member.serialize()}), 201


@member_bp.route('/members', methods=['GET'])
def get_members():
    members = Member.query.all()
    return jsonify([m.serialize() for m in members]), 200


@member_bp.route('/members/<int:user_id>', methods=['GET'])
def get_member_by_user(user_id):
    member = Member.query.filter_by(user_id=user_id).first()
    if not member:
        return jsonify({"message": "Member not found"}), 404
    return jsonify(member.serialize()), 200


@member_bp.route('/members/<int:id>', methods=['DELETE'])
def delete_member(id):
    member = Member.query.get_or_404(id)
    db.session.delete(member)
    db.session.commit()
    return jsonify({"message": "Member removed"}), 200
