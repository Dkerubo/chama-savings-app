# ✅ BACKEND ROUTE (Flask): contribution_routes.py

from flask import Blueprint, request, jsonify
from server.extensions import db
from server.models.contribution import Contribution

contribution_bp = Blueprint('contribution', __name__, url_prefix='/api/contributions')

@contribution_bp.route('/', methods=['GET'])
def get_all_contributions():
    try:
        member_id = request.args.get('member_id')
        group_id = request.args.get('group_id')
        status = request.args.get('status')

        query = Contribution.query

        if member_id:
            query = query.filter_by(member_id=member_id)
        if group_id:
            query = query.filter_by(group_id=group_id)
        if status:
            query = query.filter_by(status=status)

        contributions = query.order_by(Contribution.created_at.desc()).all()
        return jsonify([c.serialize() for c in contributions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contribution_bp.route('/<int:id>', methods=['GET'])
def get_contribution(id):
    try:
        contribution = Contribution.query.get_or_404(id)
        return jsonify(contribution.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contribution_bp.route('/', methods=['POST'])
def create_contribution():
    data = request.get_json()
    try:
        contribution = Contribution(
            member_id=data['member_id'],
            group_id=data['group_id'],
            amount=data['amount'],
            note=data.get('note'),
            receipt_number=data.get('receipt_number'),
            status=data.get('status', 'pending'),
        )
        db.session.add(contribution)
        db.session.commit()
        return jsonify(contribution.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@contribution_bp.route('/<int:id>', methods=['PUT'])
def update_contribution(id):
    data = request.get_json()
    try:
        contribution = Contribution.query.get_or_404(id)
        contribution.amount = data.get('amount', contribution.amount)
        contribution.note = data.get('note', contribution.note)
        contribution.status = data.get('status', contribution.status)
        contribution.receipt_number = data.get('receipt_number', contribution.receipt_number)
        contribution.group_id = data.get('group_id', contribution.group_id)
        contribution.member_id = data.get('member_id', contribution.member_id)

        db.session.commit()
        return jsonify(contribution.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@contribution_bp.route('/<int:id>', methods=['DELETE'])
def delete_contribution(id):
    try:
        contribution = Contribution.query.get_or_404(id)
        db.session.delete(contribution)
        db.session.commit()
        return jsonify({'message': 'Contribution deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
