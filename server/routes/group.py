from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.extensions import db
from server.models.group import Group
from decimal import Decimal

group_bp = Blueprint('group', __name__, url_prefix='/api/groups')


# ─────────────────────────────
# GET all groups
# ─────────────────────────────
@group_bp.route('/', methods=['GET'])
def get_all_groups():
    try:
        groups = Group.query.all()
        return jsonify([group.serialize() for group in groups]), 200
    except Exception as e:
        print("❌ Error in /api/groups/:", e)
        return jsonify({'error': 'Internal Server Error'}), 500


# ─────────────────────────────
# GET a single group by ID
# ─────────────────────────────
@group_bp.route('/<int:id>', methods=['GET'])
def get_group(id):
    try:
        group = Group.query.get_or_404(id)
        return jsonify(group.serialize()), 200
    except Exception as e:
        print("❌ Error fetching group:", repr(e))
        return jsonify({'error': 'Group not found'}), 404


# ─────────────────────────────
# POST - Create a new group
# ─────────────────────────────
@group_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('name') or not data.get('target_amount'):
        return jsonify({'error': 'Name and target amount are required.'}), 400

    try:
        target_amount = Decimal(str(data['target_amount']))
        if target_amount <= 0:
            raise ValueError("Target amount must be greater than 0")
    except Exception as e:
        print("❌ Invalid target_amount:", e)
        return jsonify({'error': 'Invalid target amount'}), 400

    try:
        group = Group(
            name=data['name'].strip(),
            description=data.get('description'),
            target_amount=target_amount,
            meeting_schedule=data.get('meeting_schedule'),
            location=data.get('location'),
            is_public=data.get('is_public', True),
            logo_url=data.get('logo_url'),
            admin_id=current_user_id
        )
        db.session.add(group)
        db.session.commit()
        return jsonify(group.serialize()), 201

    except Exception as e:
        db.session.rollback()
        print("❌ Error creating group:", e)
        return jsonify({'error': 'Failed to create group'}), 500


# ─────────────────────────────
# PUT - Update an existing group
# ─────────────────────────────
@group_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_group(id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    try:
        group = Group.query.get_or_404(id)

        if group.admin_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        group.name = data.get('name', group.name)
        group.description = data.get('description', group.description)

        if 'target_amount' in data:
            try:
                group.target_amount = Decimal(str(data['target_amount']))
                if group.target_amount <= 0:
                    raise ValueError("Target amount must be positive")
            except Exception:
                return jsonify({'error': 'Invalid target amount'}), 400

        group.meeting_schedule = data.get('meeting_schedule', group.meeting_schedule)
        group.location = data.get('location', group.location)
        group.logo_url = data.get('logo_url', group.logo_url)
        group.is_public = data.get('is_public', group.is_public)

        db.session.commit()
        return jsonify(group.serialize()), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error updating group:", repr(e))
        return jsonify({'error': 'Failed to update group'}), 500


# ─────────────────────────────
# DELETE - Remove a group
# ─────────────────────────────
@group_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_group(id):
    current_user_id = get_jwt_identity()

    try:
        group = Group.query.get_or_404(id)

        if group.admin_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Group deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error deleting group:", repr(e))
        return jsonify({'error': 'Failed to delete group'}), 500
