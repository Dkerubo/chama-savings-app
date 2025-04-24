from flask import Blueprint, request, jsonify
from app import db
from app.models.investment import Investment
from app.models.member import Member
from datetime import datetime

investment_bp = Blueprint('investment_bp', __name__)

# Add a new investment
@investment_bp.route('/investments', methods=['POST'])
def add_investment():
    data = request.json
    member = Member.query.get(data.get('member_id'))
    if not member:
        return jsonify({"message": "Member not found"}), 404
    
    investment = Investment(
        member_id=data['member_id'],
        amount=data['amount'],
        status=data.get('status', 'active')
    )
    db.session.add(investment)
    db.session.commit()
    return jsonify({"message": "Investment added", "investment": investment.serialize()}), 201

# Get all investments (admin) or filter by member ID
@investment_bp.route('/investments', methods=['GET'])
def get_investments():
    member_id = request.args.get('member_id')
    query = Investment.query
    if member_id:
        query = query.filter_by(member_id=member_id)
    investments = query.all()
    return jsonify([i.serialize() for i in investments]), 200

# Get all investments for a specific member
@investment_bp.route('/investments/member/<int:member_id>', methods=['GET'])
def get_investments_by_member(member_id):
    investments = Investment.query.filter_by(member_id=member_id).all()
    return jsonify([i.serialize() for i in investments]), 200

# Update investment status (e.g., activate/deactivate)
@investment_bp.route('/investments/<int:id>', methods=['PUT'])
def update_investment(id):
    investment = Investment.query.get_or_404(id)
    data = request.json
    investment.status = data.get('status', investment.status)
    db.session.commit()
    return jsonify({"message": "Investment updated", "investment": investment.serialize()}), 200

# Delete an investment
@investment_bp.route('/investments/<int:id>', methods=['DELETE'])
def delete_investment(id):
    investment = Investment.query.get_or_404(id)
    db.session.delete(investment)
    db.session.commit()
    return jsonify({"message": "Investment deleted"}), 200
