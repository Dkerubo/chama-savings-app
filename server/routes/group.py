from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.group import Group

group_bp = Blueprint('group', __name__)

@group_bp.route('/', methods=['GET'])
def get_all_groups():
    try:
        groups = Group.query.all()
        return jsonify([group.serialize() for group in groups]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@group_bp.route('/<int:id>', methods=['GET'])
def get_group(id):
    try:
        group = Group.query.get_or_404(id)
        return jsonify(group.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@group_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    try:
        if not data.get('name') or not data.get('target_amount'):
            return jsonify({'error': 'Missing name or target_amount'}), 400

        group = Group(
            name=data['name'],
            target_amount=data['target_amount'],
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
        return jsonify({'error': str(e)}), 400

@group_bp.route('/<int:id>', methods=['PUT'])
def update_group(id):
    data = request.get_json()
    try:
        group = Group.query.get_or_404(id)
        group.name = data.get('name', group.name)
        group.description = data.get('description', group.description)
        group.target_amount = data.get('target_amount', group.target_amount)
        group.admin_id = data.get('admin_id', group.admin_id)

        db.session.commit()
        return jsonify(group.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@group_bp.route('/<int:id>', methods=['DELETE'])
def delete_group(id):
    try:
        group = Group.query.get_or_404(id)
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Group deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500