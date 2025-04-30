from flask import Blueprint, request, jsonify
from app import db
from app.models.contribution import Contribution
from app.models.member import Member

contribution_bp = Blueprint('contribution_bp', __name__)

# Create a contribution
@contribution_bp.route('/contributions', methods=['POST'])
def add_contribution():
    data = request.json
    member_id = data.get('member_id')
    amount = data.get('amount')

    if not member_id or amount is None:
        return jsonify({"error": "Missing member_id or amount"}), 400

    member = Member.query.get(member_id)
    if not member:
        return jsonify({"error": "Member not found"}), 404

    contribution = Contribution(member_id=member_id, amount=amount)
    db.session.add(contribution)
    db.session.commit()

    return jsonify({
        "message": "Contribution added",
        "contribution": contribution.serialize()
    }), 201


# Read all contributions
@contribution_bp.route('/contributions', methods=['GET'])
def get_all_contributions():
    contributions = Contribution.query.all()
    return jsonify([c.serialize() for c in contributions]), 200


# Read contributions by member
@contribution_bp.route('/contributions/member/<int:member_id>', methods=['GET'])
def get_contributions_by_member(member_id):
    contributions = Contribution.query.filter_by(member_id=member_id).all()
    return jsonify([c.serialize() for c in contributions]), 200


# Read a single contribution by ID
@contribution_bp.route('/contributions/<int:id>', methods=['GET'])
def get_contribution_by_id(id):
    contribution = Contribution.query.get(id)
    if not contribution:
        return jsonify({"error": "Contribution not found"}), 404
    return jsonify(contribution.serialize()), 200


# Update a contribution
@contribution_bp.route('/contributions/<int:id>', methods=['PUT'])
def update_contribution(id):
    data = request.json
    amount = data.get('amount')

    contribution = Contribution.query.get(id)
    if not contribution:
        return jsonify({"error": "Contribution not found"}), 404

    if amount is None:
        return jsonify({"error": "Missing amount"}), 400

    contribution.amount = amount
    db.session.commit()

    return jsonify({
        "message": "Contribution updated",
        "contribution": contribution.serialize()
    }), 200


# Delete a contribution
@contribution_bp.route('/contributions/<int:id>', methods=['DELETE'])
def delete_contribution(id):
    contribution = Contribution.query.get(id)
    if not contribution:
        return jsonify({"error": "Contribution not found"}), 404

    db.session.delete(contribution)
    db.session.commit()
    return jsonify({"message": "Contribution deleted"}), 200
