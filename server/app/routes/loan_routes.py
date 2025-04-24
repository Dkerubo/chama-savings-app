from flask import Blueprint, request, jsonify
from app import db
from app.models.loan import Loan
from app.models.loan_repayment import LoanRepayment
from app.models.member import Member
from datetime import datetime

loan_bp = Blueprint('loan_bp', __name__)

# Apply for a new loan
@loan_bp.route('/loans', methods=['POST'])
def apply_loan():
    data = request.json
    member = Member.query.get(data.get('member_id'))
    if not member:
        return jsonify({"message": "Member not found"}), 404

    loan = Loan(
        member_id=data['member_id'],
        amount=data['amount'],
        interest_rate=data.get('interest_rate', 0.10),
        term_months=data['term_months']
    )
    db.session.add(loan)
    db.session.commit()
    return jsonify({"message": "Loan requested", "loan": loan.serialize()}), 201

# Get all loans (admin) or filter by status/query params
@loan_bp.route('/loans', methods=['GET'])
def get_loans():
    status = request.args.get('status')
    query = Loan.query
    if status:
        query = query.filter_by(status=status)
    loans = query.all()
    return jsonify([l.serialize() for l in loans]), 200

# Get all loans for a specific member
@loan_bp.route('/loans/member/<int:member_id>', methods=['GET'])
def get_loans_by_member(member_id):
    loans = Loan.query.filter_by(member_id=member_id).all()
    return jsonify([l.serialize() for l in loans]), 200

# Update loan status (e.g., approve/reject)
@loan_bp.route('/loans/<int:id>', methods=['PUT'])
def update_loan(id):
    loan = Loan.query.get_or_404(id)
    data = request.json
    # Allow status change and record approved_at if approved
    loan.status = data.get('status', loan.status)
    if loan.status == 'approved' and loan.approved_at is None:
        loan.approved_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Loan updated", "loan": loan.serialize()}), 200

# Delete a loan
@loan_bp.route('/loans/<int:id>', methods=['DELETE'])
def delete_loan(id):
    loan = Loan.query.get_or_404(id)
    db.session.delete(loan)
    db.session.commit()
    return jsonify({"message": "Loan deleted"}), 200

# Record a repayment
@loan_bp.route('/loans/<int:loan_id>/repayments', methods=['POST'])
def add_repayment(loan_id):
    loan = Loan.query.get_or_404(loan_id)
    data = request.json
    repayment = LoanRepayment(
        loan_id=loan_id,
        amount=data['amount'],
        note=data.get('note')
    )
    db.session.add(repayment)
    db.session.commit()
    return jsonify({"message": "Repayment recorded", "repayment": repayment.serialize()}), 201

# Get all repayments for a loan
@loan_bp.route('/loans/<int:loan_id>/repayments', methods=['GET'])
def get_repayments(loan_id):
    repayments = LoanRepayment.query.filter_by(loan_id=loan_id).all()
    return jsonify([r.serialize() for r in repayments]), 200
