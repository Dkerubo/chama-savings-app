
from app.models.memberships import Membership, Role
from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

membership_bp = Blueprint('membership', __name__)

@membership_bp.route('/roles', methods=['POST'])
def create_role():
    data = request.json
    role = Role(name=data['name'], description=data.get('description'))
    db.session.add(role)
    db.session.commit()
    return jsonify({"message": "Role created", "id": role.id})

@membership_bp.route('/membership', methods=['POST'])
def assign_membership():
    data = request.json
    membership = Membership(
        group_id=data['group_id'],
        user_id=data['user_id'],
        role_id=data['role_id']
    )
    db.session.add(membership)
    db.session.commit()
    return jsonify({"message": "Membership assigned"})
