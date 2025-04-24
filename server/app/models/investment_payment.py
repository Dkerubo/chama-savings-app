from datetime import datetime
from app import db

class InvestmentPayment(db.Model):
    __tablename__ = 'investment_payments'

    id = db.Column(db.Integer, primary_key=True)
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    investment = db.relationship('Investment', backref=db.backref('payments', lazy=True))

    def serialize(self):
        return {
            "id": self.id,
            "investment_id": self.investment_id,
            "amount": self.amount,
            "payment_date": self.payment_date.isoformat()
        }
