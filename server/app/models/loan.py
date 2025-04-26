from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import event, func
from sqlalchemy.orm import validates
from decimal import Decimal

class Loan(db.Model):
    __tablename__ = 'loans'
    
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)  # Using Numeric for precise financial amounts
    interest_rate = db.Column(db.Numeric(5, 2), default=Decimal('0.10'), nullable=False)  # 10% default
    term_months = db.Column(db.Integer, nullable=False)
    requested_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    approved_at = db.Column(db.DateTime)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Admin who approved
    status = db.Column(db.String(20), default='pending', nullable=False)  # 'pending', 'approved', 'rejected', 'active', 'paid', 'defaulted'
    issue_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    purpose = db.Column(db.Text)
    balance = db.Column(db.Numeric(12, 2), default=0, nullable=False)  # Remaining balance
    guarantor_id = db.Column(db.Integer, db.ForeignKey('members.id'))  # Optional guarantor
    
    # Relationships
    member = db.relationship('Member', foreign_keys=[member_id], back_populates='loans')
    group = db.relationship('Group', back_populates='loans')
    repayments = db.relationship('LoanRepayment', back_populates='loan', cascade='all, delete-orphan')
    approver = db.relationship('User', foreign_keys=[approved_by])
    guarantor = db.relationship('Member', foreign_keys=[guarantor_id])
    
    def __init__(self, member_id, group_id, amount, term_months, purpose=None, **kwargs):
        self.member_id = member_id
        self.group_id = group_id
        self.amount = amount
        self.balance = amount  # Initial balance equals loan amount
        self.term_months = term_months
        self.purpose = purpose
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    @validates('amount', 'interest_rate')
    def validate_financials(self, key, value):
        """Validate financial fields"""
        if key == 'amount' and value <= 0:
            raise ValueError("Loan amount must be positive")
        if key == 'interest_rate' and (value < 0 or value > 1):
            raise ValueError("Interest rate must be between 0 and 1 (0% to 100%)")
        return value
    
    def serialize(self):
        """Return comprehensive loan data in serializable format"""
        return {
            'id': self.id,
            'member_id': self.member_id,
            'group_id': self.group_id,
            'amount': float(self.amount),
            'interest_rate': float(self.interest_rate),
            'term_months': self.term_months,
            'status': self.status,
            'requested_at': self.requested_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'purpose': self.purpose,
            'balance': float(self.balance),
            'member_name': self.member.user.username if self.member and self.member.user else None,
            'group_name': self.group.name if self.group else None,
            'repayments': [r.serialize() for r in self.repayments],
            'total_paid': float(self.amount - self.balance) if self.balance else float(self.amount),
            'progress': self.payment_progress(),
            'guarantor': self.guarantor.user.username if self.guarantor and self.guarantor.user else None
        }
    
    def approve(self, approver_id):
        """Approve the loan application"""
        self.status = 'approved'
        self.approved_at = datetime.utcnow()
        self.approved_by = approver_id
        self.set_dates()
    
    def reject(self):
        """Reject the loan application"""
        self.status = 'rejected'
    
    def set_dates(self):
        """Set issue and due dates based on term"""
        self.issue_date = datetime.utcnow()
        self.due_date = self.issue_date + timedelta(days=30 * self.term_months)
    
    def update_balance(self):
        """Recalculate loan balance from repayments"""
        total_paid = sum(
            r.amount for r in self.repayments 
            if r.status in ['partial', 'full', 'verified']
        )
        self.balance = max(Decimal('0'), self.amount - Decimal(str(total_paid)))
        
        # Update status if fully paid
        if self.balance <= 0:
            self.status = 'paid'
        elif datetime.utcnow() > self.due_date and self.status == 'active':
            self.status = 'defaulted'
    
    def payment_progress(self):
        """Calculate payment progress percentage"""
        if self.amount <= 0:
            return 0
        return min(100, float((self.amount - self.balance) / self.amount * 100))
    
    def monthly_payment(self):
        """Calculate monthly payment amount"""
        if self.term_months <= 0:
            return 0
        monthly_rate = self.interest_rate / 12
        return float(
            (self.amount * monthly_rate * (1 + monthly_rate)**self.term_months) /
            ((1 + monthly_rate)**self.term_months - 1)
        )
    
    def __repr__(self):
        return (f'<Loan {self.amount} (ID: {self.id}) '
                f'for Member {self.member_id}, Status: {self.status}>')

# Event listeners
@event.listens_for(Loan, 'after_update')
def after_loan_update(mapper, connection, target):
    """Update related records when loan changes"""
    if target.status == 'approved':
        print(f"Loan {target.id} approved. Notifying member {target.member_id}")
