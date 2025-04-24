from datetime import datetime
from app import db

class LoanRepayment(db.Model):
    __tablename__ = 'loan_repayments'

    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.Column(db.String(255), nullable=True)

    # Relationship: LoanRepayment belongs to a Loan
    loan = db.relationship('Loan', backref='repayments')

    # Serialize method to convert to dictionary
    def serialize(self):
        return {
            "id": self.id,
            "loan_id": self.loan_id,
            "amount": self.amount,
            "paid_at": self.paid_at.isoformat(),
            "note": self.note  # Including note in the serialized data
        }
