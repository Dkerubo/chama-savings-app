from datetime import datetime
from decimal import Decimal, InvalidOperation
from sqlalchemy import event, func
from sqlalchemy.orm import validates
from server.extensions import db


class Group(db.Model):
    __tablename__ = 'groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    target_amount = db.Column(db.Numeric(12, 2), nullable=False)
    current_amount = db.Column(db.Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    meeting_schedule = db.Column(db.String(100))
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='active', nullable=False)
    logo_url = db.Column(db.String(255))

    # Relationships
    admin = db.relationship('User', back_populates='admin_groups')
    members = db.relationship('Member', back_populates='group', cascade='all, delete-orphan')
    contributions = db.relationship("Contribution", back_populates="group", cascade="all, delete-orphan")

    def __init__(self, name, admin_id, target_amount, **kwargs):
        self.name = name
        self.admin_id = admin_id
        self.target_amount = Decimal(str(target_amount))
        for key, value in kwargs.items():
            setattr(self, key, value)

    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) < 3:
            raise ValueError('Group name must be at least 3 characters')
        return name.strip()

    @validates('target_amount')
    def validate_target_amount(self, key, amount):
        try:
            decimal_amount = Decimal(str(amount))
            if decimal_amount <= 0:
                raise ValueError('Target amount must be positive')
            return decimal_amount
        except (InvalidOperation, ValueError):
            raise ValueError('Invalid target amount')

    def calculate_current_amount(self):
        try:
            return float(sum([
                float(c.amount or 0) for c in self.contributions or [] if c.status == 'confirmed'
            ]))
        except Exception as e:
            print(f"❌ Error in calculate_current_amount for group {self.id}: {e}")
            return 0.0

    def calculate_progress(self):
        try:
            if self.target_amount and self.target_amount > 0:
                return float(self.calculate_current_amount() / self.target_amount * 100)
            return 0.0
        except Exception as e:
            print(f"❌ Error in calculate_progress for group {self.id}: {e}")
            return 0.0

    def serialize(self):
        try:
            return {
                'id': self.id,
                'name': self.name,
                'description': self.description,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'target_amount': float(self.target_amount or 0),
                'current_amount': self.calculate_current_amount(),
                'is_public': self.is_public,
                'status': self.status or 'active',
                'admin_name': self.admin.username if self.admin else 'Unknown',
                'admin_id': self.admin_id,
                'meeting_schedule': self.meeting_schedule,
                'location': self.location,
                'logo_url': self.logo_url,
                'progress': round(self.calculate_progress(), 2),
                'member_count': len(self.members or [])
            }
        except Exception as e:
            print(f"❌ Error serializing group {self.id}: {e}")
            return {'error': f'Failed to serialize group {self.id}'}

    def __repr__(self):
        return f'<Group {self.name} (ID: {self.id})>'


@event.listens_for(Group, 'after_insert')
def after_group_insert(mapper, connection, target):
    print(f"✅ New group created: {target.name} (ID: {target.id})")


@event.listens_for(Group, 'before_update')
def before_group_update(mapper, connection, target):
    if target.status == 'archived' and target.current_amount < target.target_amount:
        raise ValueError("Cannot archive group before reaching target amount")
