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
    status = db.Column(db.String(20), default='active', nullable=False)  # 'active', 'inactive', 'archived'
    logo_url = db.Column(db.String(255))

    # Relationships
    admin = db.relationship('User', back_populates='admin_groups')
    members = db.relationship('Member', back_populates='group', cascade='all, delete-orphan')
    contributions = db.relationship('Contribution', back_populates='group', cascade='all, delete-orphan')
    loans = db.relationship('Loan', back_populates='group', cascade='all, delete-orphan')
    investments = db.relationship('Investment', back_populates='group', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('idx_group_status', 'status'),  # Index for status queries
    )

    def __init__(self, name, admin_id, target_amount, **kwargs):
        self.name = name
        self.admin_id = admin_id
        self.target_amount = target_amount
        # Automatically set the creator as the admin
        self.admin_id = admin_id  # Ensures the creator is always set as the admin
        for key, value in kwargs.items():
            setattr(self, key, value)

    @validates('name')
    def validate_name(self, key, name):
        """Validate group name"""
        if len(name) < 3:
            raise ValueError('Group name must be at least 3 characters')
        return name

    @validates('target_amount')
    def validate_target_amount(self, key, amount):
        """Validate target amount is positive"""
        if amount <= 0:
            raise ValueError('Target amount must be positive')
        return amount

    def serialize(self, include_members=False):
        """Return comprehensive group data in serializable format"""
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
            'member_count': self.active_members_count(),
            'meeting_schedule': self.meeting_schedule,
            'location': self.location,
            'logo_url': self.logo_url,
        }
        if include_members:
            data['members'] = [m.serialize() for m in self.members]
        return data

    def update_current_amount(self):
        """Recalculate current amount from confirmed contributions"""
        total = sum(
            contribution.amount
            for contribution in self.contributions
            if contribution.status == 'confirmed'
        )
        self.current_amount = total
        return self.current_amount

    def progress_percentage(self):
        """Calculate progress towards target amount"""
        if self.target_amount <= 0:
            return 0
        return min(100, float((self.current_amount / self.target_amount) * 100))

    def active_members_count(self):
        """Count active members in the group"""
        return len([m for m in self.members if m.status == 'active'])

    def activate(self):
        """Activate the group"""
        self.status = 'active'

    def archive(self):
        """Archive the group (soft delete)"""
        self.status = 'archived'

    def add_member(self, user_id, is_admin=False):
        """Add a new member to the group, only allowed for admins"""
        from app.models import User  # Import here to avoid circular import

        # Ensure the user is not already a member of the group
        existing_member = next((m for m in self.members if m.user_id == user_id), None)
        if existing_member:
            raise ValueError("User is already a member of this group")

        user = User.query.get(user_id)
        if not user:
            raise ValueError("User does not exist")

        # Admin can add members, optionally assigning them admin status
            new_member = Member(
            user_id=user_id,
            group_id=self.id,
            is_admin=is_admin,
            status='active' if self.is_public else 'pending'
        )
            db.session.add(new_member)
            return new_member

    def __repr__(self):
        return f'<Group {self.name} (ID: {self.id}), Admin: {self.admin_id}, Status: {self.status}>'


# Event listeners
@event.listens_for(Group, 'after_insert')
def after_group_insert(mapper, connection, target):
    """Trigger notifications after group creation"""
    print(f"New group created: {target.name} (ID: {target.id})")
    # In a real app, you might send notifications here


@event.listens_for(Group, 'before_update')
def before_group_update(mapper, connection, target):
    """Validate data before update"""
    if target.status == 'archived' and target.current_amount < target.target_amount:
        raise ValueError("Cannot archive group before reaching target amount")
