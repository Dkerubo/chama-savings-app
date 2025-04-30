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
    member_id = data.get('member_id')
    amount = data.get('amount')
    term_months = data.get('term_months')

    if not member_id or not amount or not term_months:
        return jsonify({"error": "Missing required fields"}), 400

    member = Member.query.get(member_id)
    if not member:
        return jsonify({"error": "Member not found"}), 404

    loan = Loan(
        member_id=member_id,
        amount=amount,
        interest_rate=data.get('interest_rate', 0.10),
        term_months=term_months,
        status='pending',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.session.add(loan)
    db.session.commit()

    return jsonify({
        "message": "Loan application submitted",
        "loan": loan.serialize()
    }), 201


# Get all loans or filter by status
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


# Update a loan (e.g., approve/reject)
@loan_bp.route('/loans/<int:id>', methods=['PUT'])
def update_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({"error": "Loan not found"}), 404

    data = request.json
    status = data.get('status')
    if status:
        loan.status = status
        if status == 'approved' and not loan.approved_at:
            loan.approved_at = datetime.utcnow()

    loan.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": "Loan updated successfully",
        "loan": loan.serialize()
    }), 200


# Delete a loan
@loan_bp.route('/loans/<int:id>', methods=['DELETE'])
def delete_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({"error": "Loan not found"}), 404

    db.session.delete(loan)
    db.session.commit()

    return jsonify({"message": "Loan deleted successfully"}), 200


# Add a loan repayment
@loan_bp.route('/loans/<int:loan_id>/repayments', methods=['POST'])
def add_repayment(loan_id):
    loan = Loan.query.get(loan_id)
    if not loan:
        return jsonify({"error": "Loan not found"}), 404

    data = request.json
    amount = data.get('amount')

    if not amount:
        return jsonify({"error": "Repayment amount is required"}), 400

    repayment = LoanRepayment(
        loan_id=loan_id,
        amount=amount,
        note=data.get('note'),
        created_at=datetime.utcnow()
    )

    db.session.add(repayment)
    db.session.commit()

    return jsonify({
        "message": "Repayment recorded",
        "repayment": repayment.serialize()
    }), 201


# Get all repayments for a specific loan
@loan_bp.route('/loans/<int:loan_id>/repayments', methods=['GET'])
def get_repayments(loan_id):
    repayments = LoanRepayment.query.filter_by(loan_id=loan_id).all()
    return jsonify([r.serialize() for r in repayments]), 200
