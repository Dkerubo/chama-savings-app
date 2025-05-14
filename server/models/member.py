from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import validates
from extensions import db

class Member(db.Model):
    __tablename__ = 'members'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    join_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    last_active = db.Column(db.DateTime)
    contribution_score = db.Column(db.Integer, default=0)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
  

    # Relationships
    user = db.relationship('User', back_populates='members')
    group = db.relationship('Group', back_populates='members')
    contributions = db.relationship('Contribution', back_populates='member', cascade='all, delete-orphan')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  
   

    __table_args__ = (
        db.UniqueConstraint('user_id', 'group_id', name='unique_member'),
        db.Index('idx_member_status', 'status'),
    )

    def __init__(self, user_id, group_id, is_admin=False, **kwargs):
        self.user_id = user_id
        self.group_id = group_id
        self.is_admin = is_admin
        for key, value in kwargs.items():
            setattr(self, key, value)

    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['pending', 'active', 'inactive', 'suspended']
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
        return status

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'group_id': self.group_id,
            'join_date': self.join_date.isoformat(),
            'status': self.status,
            'is_admin': self.is_admin,
            'last_active': self.last_active.isoformat() if self.last_active else None,
            'contribution_score': self.contribution_score,
            'phone': self.phone,
            'address': self.address,
            'user_details': {
                'username': self.user.username,
                'email': self.user.email
            } if self.user else None,
            'group_name': self.group.name if self.group else None,
            'total_contributions': sum(c.amount for c in self.contributions if c.status == 'confirmed'),
            'active_loans': len([l for l in self.loans if l.status in ['active', 'defaulted']]),
            'active_investments': len([i for i in self.investments if i.status == 'active'])
        }

    def activate(self):
        if self.status == 'pending':
            self.status = 'active'
            self.join_date = datetime.utcnow()

    def update_activity(self):
        self.last_active = datetime.utcnow()

    def update_contribution_score(self):
        confirmed_contributions = sum(1 for c in self.contributions if c.status == 'confirmed')
        timely_repayments = sum(1 for l in self.loans for r in l.repayments if r.status == 'full')
        self.contribution_score = confirmed_contributions + timely_repayments

    def can_request_loan(self):
        return (
            self.status == 'active' and
            not any(l for l in self.loans if l.status in ['active', 'defaulted'])
        )

    def __repr__(self):
        return (
            f'<Member ID: {self.id}, User: {self.user_id}, Group: {self.group_id}, '
            f'Status: {self.status}, Admin: {self.is_admin}>'
        )

# Event listeners
@event.listens_for(Member, 'after_insert')
def after_member_insert(mapper, connection, target):
    print(f"New member joined: User {target.user_id} to Group {target.group_id}")
    session = db.object_session(target)
    member_count = session.query(Member).filter_by(group_id=target.group_id).count()

    if member_count == 1:
        target.status = 'active'
        target.is_admin = True
        session.commit()
        print(f"User {target.user_id} is the group creator and now admin of Group {target.group_id}")
    elif member_count > 30:
        print(f"Warning: Group {target.group_id} exceeded 30 members!")

@event.listens_for(Member, 'after_update')
def after_member_update(mapper, connection, target):
    if target.status == 'active':
        print(f"Member {target.id} activated in Group {target.group_id}")
