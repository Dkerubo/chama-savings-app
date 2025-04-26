from datetime import datetime
from app.extensions import db
from sqlalchemy import event

class Contribution(db.Model):
    __tablename__ = 'contributions'
    
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    note = db.Column(db.String(255))
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # 'pending', 'confirmed', 'rejected'
    receipt_number = db.Column(db.String(50), unique=True)

    # Relationships
    member = db.relationship('Member', back_populates='contributions')
    group = db.relationship('Group', back_populates='contributions')
    
    def __init__(self, member_id, group_id, amount, note=None, receipt_number=None):
        self.member_id = member_id
        self.group_id = group_id
        self.amount = amount
        self.note = note
        self.receipt_number = receipt_number
    
    def serialize(self):
        """Return object data in easily serializable format."""
        return {
            'id': self.id,
            'member_id': self.member_id,
            'group_id': self.group_id,
            'amount': float(self.amount) if self.amount is not None else None,
            'note': self.note,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'receipt_number': self.receipt_number,
            'member_name': self.member.user.username if self.member and self.member.user else None
        }
    
    def confirm(self):
        """Mark contribution as confirmed and update group's current amount."""
        self.status = 'confirmed'
        if self.group:
            self.group.current_amount += self.amount
    
    def reject(self):
        """Mark contribution as rejected."""
        self.status = 'rejected'
    
    def __repr__(self):
        return f'<Contribution {self.amount} (ID: {self.id}) by Member {self.member_id}>'

# Event listener
@event.listens_for(Contribution, 'after_insert')
def after_contribution_insert(mapper, connection, target):
    """Triggered after a new contribution is inserted."""
    print(f"New contribution recorded: {target.amount} by member {target.member_id}")
