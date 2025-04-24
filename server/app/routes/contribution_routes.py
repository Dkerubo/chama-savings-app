from flask import Blueprint, request, jsonify
from app import db
from app.models.contribution import Contribution
from app.models.member import Member

contribution_bp = Blueprint('contribution_bp', __name__)

@contribution_bp.route('/contributions', methods=['POST'])
def add_contribution():
    data = request.json
    member_id = data.get('member_id')
    amount = data.get('amount')

    member = Member.query.get(member_id)
    if not member:
        return jsonify({"message": "Member not found"}), 404

    contribution = Contribution(member_id=member_id, amount=amount)
    db.session.add(contribution)
    db.session.commit()

    return jsonify({"message": "Contribution added", "contribution": contribution.serialize()}), 201


@contribution_bp.route('/contributions', methods=['GET'])
def get_all_contributions():
    contributions = Contribution.query.all()
    return jsonify([c.serialize() for c in contributions]), 200


@contribution_bp.route('/contributions/member/<int:member_id>', methods=['GET'])
def get_contributions_by_member(member_id):
    contributions = Contribution.query.filter_by(member_id=member_id).all()
    return jsonify([c.serialize() for c in contributions]), 200


@contribution_bp.route('/contributions/<int:id>', methods=['DELETE'])
def delete_contribution(id):
    contribution = Contribution.query.get_or_404(id)
    db.session.delete(contribution)
    db.session.commit()
    return jsonify({"message": "Contribution deleted"}), 200
