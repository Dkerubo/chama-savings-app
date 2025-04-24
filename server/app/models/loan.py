from datetime import datetime
from app import db

class Loan(db.Model):
    __tablename__ = 'loans'

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, default=0.1)  # 10% default rate
    term_months = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected, paid
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)

    # Relationship: Loan belongs to a Member
    member = db.relationship('Member', backref='loans')

    # Serialize method to convert to dictionary
    def serialize(self):
        return {
            "id": self.id,
            "member_id": self.member_id,
            "amount": self.amount,
            "interest_rate": self.interest_rate,
            "term_months": self.term_months,
            "status": self.status,
            "requested_at": self.requested_at.isoformat(),
            "approved_at": self.approved_at.isoformat() if self.approved_at else None
        }
