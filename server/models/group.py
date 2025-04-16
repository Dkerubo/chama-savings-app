from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.sql import func
from database import db

class Group(db.Model, SerializerMixin):
    __tablename__ = 'groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    monthly_target = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now())
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    members = db.relationship('Member', secondary='member_group', back_populates='groups')
    loans = db.relationship('Loan', back_populates='group', cascade='all, delete-orphan')
    contributions = db.relationship('Contribution', back_populates='group', cascade='all, delete-orphan')
    investments = db.relationship('Investment', back_populates='group', cascade='all, delete-orphan')

    serialize_rules = ('-members.groups', '-loans.group', '-contributions.group', '-investments.group')

    def get_total_savings(self):
        return sum(contribution.amount for contribution in self.contributions)

    def get_active_loans(self):
        return [loan for loan in self.loans if loan.status == 'Active']

    def get_active_members(self):
        return [m for m in self.members if m.status == 'Active']

    def __repr__(self):
        return f"<Group {self.name}>"