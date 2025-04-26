from datetime import datetime
from app.extensions import db
from sqlalchemy import event


class InvestmentPayment(db.Model):
    __tablename__ = 'investment_payments'
    
    id = db.Column(db.Integer, primary_key=True)
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)  # Optional payment method
    reference_number = db.Column(db.String(100), unique=True, nullable=True)  # Optional unique reference number
    
    # Relationships
    investment = db.relationship('Investment', back_populates='payments')
    
    def __init__(self, investment_id, amount, payment_method=None, reference_number=None):
        self.investment_id = investment_id
        self.amount = amount
        self.payment_method = payment_method
        self.reference_number = reference_number
    
    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id': self.id,
            'investment_id': self.investment_id,
            'amount': float(self.amount),
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'reference_number': self.reference_number,
            'investment_details': {
                'id': self.investment.id,
                'name': getattr(self.investment, 'name', None)
            } if self.investment else None
        }
    
    def mark_as_processed(self):
        """Mark the payment as processed and update related investment details"""
        if self.investment:
            self.investment.last_payment_date = self.payment_date
    
    def __repr__(self):
        return f'<InvestmentPayment {self.amount} (ID: {self.id}) for Investment {self.investment_id}>'

# Event listener for after insert
@event.listens_for(InvestmentPayment, 'after_insert')
def after_payment_insert(mapper, connection, target):
    """Example: Could be used for notifications or balance updates"""
    print(f"New investment payment recorded: {target.amount} for investment {target.investment_id}")
