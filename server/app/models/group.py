from datetime import datetime
from decimal import Decimal
from sqlalchemy import event, func
from sqlalchemy.orm import validates
from app.extensions import db

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
    loans = db.relationship("Loan", back_populates="group", cascade="all, delete-orphan")
    investments = db.relationship("Investment", back_populates="group", cascade="all, delete-orphan")
    
    def __init__(self, name, admin_id, target_amount, **kwargs):
        self.name = name
        self.admin_id = admin_id
        self.target_amount = target_amount
        for key, value in kwargs.items():
            setattr(self, key, value)

    @validates('name')
    def validate_name(self, key, name):
        if len(name) < 3:
            raise ValueError('Group name must be at least 3 characters')
        return name

    @validates('target_amount')
    def validate_target_amount(self, key, amount):
        if amount <= 0:
            raise ValueError('Target amount must be positive')
        return amount

    def serialize(self, include_members=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'target_amount': float(self.target_amount),
            'current_amount': float(self.current_amount),
            'progress': self.progress_percentage(),
            'is_public': self.is_public,
            'status': self.status,
            'admin_id': self.admin_id,
            'admin_name': self.admin.username if self.admin else None,
            'meeting_schedule': self.meeting_schedule,
            'location': self.location,
            'logo_url': self.logo_url,
            'member_count': self.active_members_count()
        }
        if include_members:
            data['members'] = [m.serialize() for m in self.members]
        return data

    def progress_percentage(self):
        if self.target_amount <= 0:
            return 0
        return min(100, float((self.current_amount / self.target_amount) * 100))

    def active_members_count(self):
        return len([m for m in self.members if m.status == 'active'])

    def __repr__(self):
        return f'<Group {self.name} (ID: {self.id})>'

@event.listens_for(Group, 'after_insert')
def after_group_insert(mapper, connection, target):
    print(f"New group created: {target.name} (ID: {target.id})")

@event.listens_for(Group, 'before_update')
def before_group_update(mapper, connection, target):
    if target.status == 'archived' and target.current_amount < target.target_amount:
        raise ValueError("Cannot archive group before reaching target amount")
