from flask import Blueprint, request, jsonify
from app import db
from app.models.investment import Investment
from app.models.member import Member
from datetime import datetime

investment_bp = Blueprint('investment_bp', __name__)

# Create a new investment
@investment_bp.route('/investments', methods=['POST'])
def add_investment():
    data = request.json
    member_id = data.get('member_id')
    amount = data.get('amount')

    if not member_id or not amount:
        return jsonify({"error": "Missing member_id or amount"}), 400

    member = Member.query.get(member_id)
    if not member:
        return jsonify({"error": "Member not found"}), 404

    investment = Investment(
        member_id=member_id,
        amount=amount,
        total_paid=0.0,
        status=data.get('status', 'active'),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.session.add(investment)
    db.session.commit()

    return jsonify({
        "message": "Investment added successfully",
        "investment": investment.serialize()
    }), 201


# Get all investments or filter by member_id
@investment_bp.route('/investments', methods=['GET'])
def get_investments():
    member_id = request.args.get('member_id')
    query = Investment.query

    if member_id:
        query = query.filter_by(member_id=member_id)

    investments = query.all()
    return jsonify([i.serialize() for i in investments]), 200


# Get investments by member (explicit route)
@investment_bp.route('/investments/member/<int:member_id>', methods=['GET'])
def get_investments_by_member(member_id):
    investments = Investment.query.filter_by(member_id=member_id).all()
    return jsonify([i.serialize() for i in investments]), 200


# Update investment status (or any field)
@investment_bp.route('/investments/<int:id>', methods=['PUT'])
def update_investment(id):
    investment = Investment.query.get(id)
    if not investment:
        return jsonify({"error": "Investment not found"}), 404

    data = request.json
    investment.status = data.get('status', investment.status)
    investment.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": "Investment updated successfully",
        "investment": investment.serialize()
    }), 200


# Delete investment
@investment_bp.route('/investments/<int:id>', methods=['DELETE'])
def delete_investment(id):
    investment = Investment.query.get(id)
    if not investment:
        return jsonify({"error": "Investment not found"}), 404

    db.session.delete(investment)
    db.session.commit()

    return jsonify({"message": "Investment deleted successfully"}), 200
