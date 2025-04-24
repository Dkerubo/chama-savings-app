from flask import Blueprint, request, jsonify
from app import db
from app.models.investment_payment import InvestmentPayment
from app.models.investment import Investment

payment_bp = Blueprint('payment_bp', __name__)

# Add payment for an investment
@payment_bp.route('/investment_payments', methods=['POST'])
def add_payment():
    data = request.json
    investment = Investment.query.get(data['investment_id'])
    if not investment:
        return jsonify({"message": "Investment not found"}), 404
    
    payment = InvestmentPayment(
        investment_id=data['investment_id'],
        amount=data['amount']
    )
    db.session.add(payment)
    investment.total_paid += data['amount']  # Update the total paid for the investment
    if investment.total_paid >= investment.amount:
        investment.status = 'completed'  # Mark the investment as completed
    db.session.commit()
    
    return jsonify({"message": "Payment added", "payment": payment.serialize(), "investment": investment.serialize()}), 201

# Get payments for an investment
@payment_bp.route('/investment_payments/investment/<int:investment_id>', methods=['GET'])
def get_payments_for_investment(investment_id):
    payments = InvestmentPayment.query.filter_by(investment_id=investment_id).all()
    return jsonify([payment.serialize() for payment in payments]), 200

# Get total payments for an investment
@payment_bp.route('/investment_payments/total/<int:investment_id>', methods=['GET'])
def get_total_payments_for_investment(investment_id):
    total_paid = db.session.query(db.func.sum(InvestmentPayment.amount)).filter_by(investment_id=investment_id).scalar()
    return jsonify({"total_paid": total_paid or 0.0}), 200
