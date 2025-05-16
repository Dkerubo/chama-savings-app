from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.group import Group
from decimal import Decimal

group_bp = Blueprint('group', __name__, url_prefix='/api/groups')

@group_bp.route('/', methods=['GET'])
def get_all_groups():
    try:
        groups = Group.query.all()
        return jsonify([group.serialize() for group in groups]), 200
    except Exception as e:
        print("❌ Error fetching groups:", repr(e))
        return jsonify({'error': str(e)}), 500

@group_bp.route('/<int:id>', methods=['GET'])
def get_group(id):
    try:
        group = Group.query.get_or_404(id)
        return jsonify(group.serialize()), 200
    except Exception as e:
        print("❌ Error fetching group:", repr(e))
        return jsonify({'error': str(e)}), 500

@group_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    print("📦 Incoming group creation data:", data)

    try:
        if not data.get('name') or not data.get('target_amount'):
            return jsonify({'error': 'Missing name or target_amount'}), 400

        # Safely convert target_amount to Decimal
        target_amount = Decimal(str(data['target_amount']))

        group = Group(
            name=data['name'],
            target_amount=target_amount,
            admin_id=current_user_id,
            description=data.get('description'),
            meeting_schedule=data.get('meeting_schedule'),
            location=data.get('location'),
            is_public=data.get('is_public', False),
            logo_url=data.get('logo_url'),
        )

        db.session.add(group)
        db.session.commit()
        return jsonify(group.serialize()), 201

    except Exception as e:
        db.session.rollback()
        print("❌ Error creating group:", repr(e))
        return jsonify({'error': str(e)}), 400

@group_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_group(id):
    data = request.get_json()
    print(f"🔄 Update request for group {id}: {data}")

    try:
        group = Group.query.get_or_404(id)

        group.name = data.get('name', group.name)
        group.description = data.get('description', group.description)

        if 'target_amount' in data:
            try:
                group.target_amount = Decimal(str(data['target_amount']))
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
        return jsonify({'error': str(e)}), 400

@group_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_group(id):
    try:
        group = Group.query.get_or_404(id)
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Group deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print("❌ Error deleting group:", repr(e))
        return jsonify({'error': str(e)}), 500
