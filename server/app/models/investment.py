from datetime import datetime
from app import db

class Investment(db.Model):
    __tablename__ = 'investments'

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    project_name = db.Column(db.String(100), nullable=False)
    returns = db.Column(db.Float, nullable=True)
    invested_at = db.Column(db.DateTime, default=datetime.utcnow)
    investment_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='active')
    total_paid = db.Column(db.Float, nullable=False, default=0.0)  # Track the total amount paid for this investment
    
    # Relationship with Member, backref to investments
    member = db.relationship('Member', backref=db.backref('investments', lazy=True))

    # Serialize method to convert to dictionary
    def serialize(self):
        return {
            "id": self.id,
            "member_id": self.member_id,
            "amount": self.amount,
            "investment_date": self.investment_date.isoformat(),
            "status": self.status,
            "total_paid": self.total_paid
        }
