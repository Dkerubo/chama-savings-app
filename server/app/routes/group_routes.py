from flask import Blueprint, request, jsonify
from app import db
from app.models.group import Group
from app.models.user import User

group_bp = Blueprint('group_bp', __name__)

@group_bp.route('/groups', methods=['POST'])
def create_group():
    data = request.json
    name = data.get('name')
    admin_id = data.get('admin_id')

    admin = User.query.get(admin_id)
    if not admin or admin.role != 'admin':
        return jsonify({"message": "Invalid admin ID"}), 400

    group = Group(name=name, admin_id=admin_id)
    db.session.add(group)
    db.session.commit()

    return jsonify({"message": "Group created", "group": group.serialize()}), 201


@group_bp.route('/groups', methods=['GET'])
def get_groups():
    groups = Group.query.all()
    return jsonify([g.serialize() for g in groups]), 200


@group_bp.route('/groups/<int:id>', methods=['GET'])
def get_group(id):
    group = Group.query.get_or_404(id)
    return jsonify(group.serialize()), 200


@group_bp.route('/groups/<int:id>', methods=['PUT'])
def update_group(id):
    group = Group.query.get_or_404(id)
    data = request.json
    group.name = data.get('name', group.name)
    db.session.commit()
    return jsonify({"message": "Group updated", "group": group.serialize()}), 200


@group_bp.route('/groups/<int:id>', methods=['DELETE'])
def delete_group(id):
    group = Group.query.get_or_404(id)
    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted"}), 200
