from flask import Blueprint, request, jsonify
from app import db
from app.models.investment_payment import InvestmentPayment
from app.models.investment import Investment

payment_bp = Blueprint('payment_bp', __name__)

# Create a payment for an investment
@payment_bp.route('/investment_payments', methods=['POST'])
def add_payment():
    data = request.json
    investment_id = data.get('investment_id')
    amount = data.get('amount')

    if not investment_id or not amount:
        return jsonify({"error": "Missing investment_id or amount"}), 400

    investment = Investment.query.get(investment_id)
    if not investment:
        return jsonify({"error": "Investment not found"}), 404

    payment = InvestmentPayment(investment_id=investment_id, amount=amount)
    db.session.add(payment)

    # Update total paid and investment status
    investment.total_paid += amount
    if investment.total_paid >= investment.amount:
        investment.status = 'completed'

    db.session.commit()

    return jsonify({
        "message": "Payment added successfully",
        "payment": payment.serialize(),
        "investment": investment.serialize()
    }), 201


# Get all payments for an investment
@payment_bp.route('/investment_payments/investment/<int:investment_id>', methods=['GET'])
def get_payments_for_investment(investment_id):
    payments = InvestmentPayment.query.filter_by(investment_id=investment_id).all()
    return jsonify([p.serialize() for p in payments]), 200


# Get total amount paid for an investment
@payment_bp.route('/investment_payments/total/<int:investment_id>', methods=['GET'])
def get_total_payments_for_investment(investment_id):
    total_paid = db.session.query(db.func.sum(InvestmentPayment.amount)) \
        .filter_by(investment_id=investment_id).scalar() or 0.0
    return jsonify({"investment_id": investment_id, "total_paid": total_paid}), 200


# Update a specific payment
@payment_bp.route('/investment_payments/<int:id>', methods=['PUT'])
def update_payment(id):
    payment = InvestmentPayment.query.get(id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    data = request.json
    new_amount = data.get('amount')

    if new_amount is None:
        return jsonify({"error": "Missing amount"}), 400

    investment = Investment.query.get(payment.investment_id)
    # Revert previous amount
    investment.total_paid -= payment.amount
    # Update payment amount
    payment.amount = new_amount
    # Add new amount
    investment.total_paid += new_amount

    # Update status
    investment.status = 'completed' if investment.total_paid >= investment.amount else 'ongoing'

    db.session.commit()

    return jsonify({
        "message": "Payment updated successfully",
        "payment": payment.serialize(),
        "investment": investment.serialize()
    }), 200


# Delete a payment
@payment_bp.route('/investment_payments/<int:id>', methods=['DELETE'])
def delete_payment(id):
    payment = InvestmentPayment.query.get(id)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    investment = Investment.query.get(payment.investment_id)
    investment.total_paid -= payment.amount
    investment.status = 'ongoing' if investment.total_paid < investment.amount else 'completed'

    db.session.delete(payment)
    db.session.commit()

    return jsonify({
        "message": "Payment deleted successfully",
        "investment": investment.serialize()
    }), 200
