from datetime import datetime
from server.extensions import db
from sqlalchemy import event
from sqlalchemy.orm import validates
from sqlalchemy.orm.session import object_session

class Contribution(db.Model):
    __tablename__ = 'contributions'

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    note = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending', nullable=False)
    receipt_number = db.Column(db.String(50), unique=True)

    # Relationships
    member = db.relationship('Member', back_populates='contributions')
    group = db.relationship('Group', back_populates='contributions')
   
    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['pending', 'confirmed', 'rejected']
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
        return status

    def __init__(self, member_id, group_id, amount, note=None, receipt_number=None, status='pending'):
        self.member_id = member_id
        self.group_id = group_id
        self.amount = amount
        self.receipt_number = receipt_number
        self.note = note
        self.status = status

    def serialize(self):
        return {
            'id': self.id,
            'member_id': self.member_id,
            'group_id': self.group_id,
            'amount': float(self.amount) if self.amount is not None else None,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'status': self.status,
            'receipt_number': self.receipt_number,
            'member_name': self.member.user.username if self.member and self.member.user else None
            
            
        }

    def confirm(self):
        if self.status != 'confirmed':
            self.status = 'confirmed'

    def reject(self):
        self.status = 'rejected'

    def __repr__(self):
        return f'<Contribution {self.amount} (ID: {self.id}) by Member {self.member_id}>'


def recalculate_group_amount(group):
    group.current_amount = sum(
        contrib.amount for contrib in group.contributions if contrib.status == 'confirmed'
    )


@event.listens_for(Contribution, 'after_insert')
@event.listens_for(Contribution, 'after_update')
@event.listens_for(Contribution, 'after_delete')
def update_group_current_amount(mapper, connection, target):
    session = object_session(target)
    if target.group:
        recalculate_group_amount(target.group)
        session.add(target.group)
