from datetime import datetime
from app.extensions import db
from sqlalchemy import event


class Investment(db.Model):
    __tablename__ = 'investments'
    
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    project_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    invested_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='active')  # 'active', 'matured', 'withdrawn', 'defaulted'
    expected_return = db.Column(db.Float)  # Expected percentage return
    expected_amount = db.Column(db.Float)  # Calculated expected return amount
    maturity_date = db.Column(db.DateTime)
    total_paid = db.Column(db.Float, default=0.0, nullable=False)  # Track total payments received
    description = db.Column(db.Text)
    risk_level = db.Column(db.String(20))  # 'low', 'medium', 'high'
    
    # Relationships
    member = db.relationship('Member', back_populates='investments')
    group = db.relationship('Group', back_populates='investments')
    payments = db.relationship('InvestmentPayment', back_populates='investment', cascade='all, delete-orphan')
    
    def __init__(self, member_id, group_id, project_name, amount, **kwargs):
        self.member_id = member_id
        self.group_id = group_id
        self.project_name = project_name
        self.amount = amount
        self.expected_amount = amount * (1 + kwargs.get('expected_return', 0) / 100)
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def serialize(self):
        """Return comprehensive investment data in serializable format"""
        return {
            'id': self.id,
            'member_id': self.member_id,
            'group_id': self.group_id,
            'project_name': self.project_name,
            'amount': float(self.amount),
            'invested_at': self.invested_at.isoformat() if self.invested_at else None,
            'status': self.status,
            'expected_return': float(self.expected_return) if self.expected_return else None,
            'expected_amount': float(self.expected_amount) if self.expected_amount else None,
            'maturity_date': self.maturity_date.isoformat() if self.maturity_date else None,
            'total_paid': float(self.total_paid),
            'description': self.description,
            'risk_level': self.risk_level,
            'member_name': self.member.user.username if self.member and self.member.user else None,
            'group_name': self.group.name if self.group else None,
            'payments': [payment.serialize() for payment in self.payments] if self.payments else []
        }
    
    def update_status(self):
        """Update investment status based on current conditions"""
        if self.maturity_date and datetime.utcnow() >= self.maturity_date:
            self.status = 'matured' if self.total_paid >= self.expected_amount else 'defaulted'
        return self.status
    
    def record_payment(self, amount):
        """Record a new payment towards this investment"""
        self.total_paid += amount
        if self.total_paid >= self.expected_amount:
            self.status = 'matured'
        return self.total_paid
    
    def calculate_progress(self):
        """Calculate investment progress percentage"""
        return min(100, (self.total_paid / self.amount) * 100) if self.amount > 0 else 0
    
    def __repr__(self):
        return f'<Investment {self.project_name} (ID: {self.id}) Amount: {self.amount}, Status: {self.status}>'

# Event listener
@event.listens_for(Investment, 'after_insert')
def after_investment_insert(mapper, connection, target):
    """Example: Could be used for notifications or portfolio updates"""
    print(f"New investment created: {target.project_name} by member {target.member_id}")
