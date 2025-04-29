from models.recurrence_rules import RecurrenceRule
from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

recurrence_bp = Blueprint('recurrence', __name__)

@recurrence_bp.route('/recurrence', methods=['POST'])
def create_recurrence():
    data = request.json
    recurrence = RecurrenceRule(
        model_type=data['model_type'],     # e.g., 'Contribution', 'Meeting', 'LoanRepayment'
        model_id=data['model_id'],         # ID of the model instance
        frequency=data['frequency'],       # e.g., 'weekly', 'monthly'
        interval=data.get('interval', 1),  # Every X weeks/months
        day_of_week=data.get('day_of_week'),
        day_of_month=data.get('day_of_month'),
        start_date=data['start_date'],
        end_date=data.get('end_date')
    )
    db.session.add(recurrence)
    db.session.commit()
    return jsonify({"message": "Recurrence rule created", "id": recurrence.id})

@recurrence_bp.route('/recurrence/<int:id>', methods=['GET'])
def get_recurrence(id):
    rule = RecurrenceRule.query.get_or_404(id)
    return jsonify({
        "id": rule.id,
        "model_type": rule.model_type,
        "model_id": rule.model_id,
        "frequency": rule.frequency,
        "interval": rule.interval,
        "day_of_week": rule.day_of_week,
        "day_of_month": rule.day_of_month,
        "start_date": rule.start_date.isoformat(),
        "end_date": rule.end_date.isoformat() if rule.end_date else None
    })
