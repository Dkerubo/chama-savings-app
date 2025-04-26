from datetime import datetime
from app.extensions import db
from sqlalchemy import event
from sqlalchemy.orm import validates

class LoanRepayment(db.Model):
    __tablename__ = 'loan_repayments'
    
    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)  # e.g., 'bank_transfer', 'cash'
    status = db.Column(db.String(20), default='partial', nullable=False)  # 'partial', 'full', 'overdue', 'failed'
    receipt_number = db.Column(db.String(50), unique=True, nullable=True)
    note = db.Column(db.Text, nullable=True)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Admin who verified
    
    # Relationships
    loan = db.relationship('Loan', back_populates='repayments')
    verifier = db.relationship('User', foreign_keys=[verified_by])
    
    def __init__(self, loan_id, amount, payment_method=None, receipt_number=None, note=None):
        self.loan_id = loan_id
        self.amount = amount
        self.payment_method = payment_method
        self.receipt_number = receipt_number
        self.note = note
    
    @validates('amount')
    def validate_amount(self, key, amount):
        """Validate that amount is positive"""
        if amount <= 0:
            raise ValueError("Repayment amount must be positive")
        return amount
    
    def serialize(self):
        """Return comprehensive repayment data in serializable format"""
        return {
            'id': self.id,
            'loan_id': self.loan_id,
            'amount': float(self.amount),
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'status': self.status,
            'receipt_number': self.receipt_number,
            'note': self.note,
            'verified_by': self.verified_by,
            'verifier_name': self.verifier.username if self.verifier else None,
            'loan_details': {
                'id': self.loan.id,
                'amount': float(self.loan.amount) if self.loan else None,
                'balance': float(self.loan.balance) if hasattr(self.loan, 'balance') else None
            } if self.loan else None
        }
    
    def mark_as_full(self):
        """Mark this repayment as fully covering the installment"""
        self.status = 'full'
        if self.loan:
            self.loan.update_balance()
    
    def verify(self, user_id):
        """Mark repayment as verified by admin"""
        self.verified_by = user_id
        self.status = 'verified'
    
    def __repr__(self):
        return (f'<LoanRepayment {self.amount} (ID: {self.id}) '
                f'for Loan {self.loan_id}, Status: {self.status}>')

# Event listeners
@event.listens_for(LoanRepayment, 'after_insert')
def after_repayment_insert(mapper, connection, target):
    """Trigger balance update after repayment"""
    if target.loan:
        target.loan.update_balance()
        print(f"New repayment recorded for Loan {target.loan_id}. New balance: {target.loan.balance}")