from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.sql import func
from database import db

# Association table for Member <-> Group many-to-many relationship
member_group = db.Table(
    'member_group',
    db.Column('member_id', db.Integer, db.ForeignKey('members.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True),
    db.Column('date_joined', db.DateTime, server_default=func.now()),
    db.Column('is_active', db.Boolean, default=True),
    db.Column('role', db.String(20), default='Member')  # Member, Leader, Treasurer
)

class Member(db.Model, SerializerMixin):
    __tablename__ = 'members'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    national_id = db.Column(db.String(20), unique=True)
    joined_date = db.Column(db.DateTime, server_default=func.now())
    status = db.Column(db.String(20), default='Active')  # Active, Inactive, Suspended
    share_balance = db.Column(db.Float, default=0.0)
    next_of_kin = db.Column(db.String(100))
    next_of_kin_contact = db.Column(db.String(20))

    # Relationships
    user = db.relationship('User', back_populates='member', uselist=False, cascade='all, delete-orphan')
    groups = db.relationship('Group', secondary=member_group, back_populates='members')
    loans = db.relationship('Loan', back_populates='member', cascade='all, delete-orphan')
    contributions = db.relationship('Contribution', back_populates='member', cascade='all, delete-orphan')
    approved_investments = db.relationship('Investment', back_populates='approved_by')

    serialize_rules = (
        '-user.member', '-groups.members', '-loans.member', 
        '-contributions.member', '-approved_investments.approved_by'
    )

    def get_total_contributions(self):
        return sum(c.amount for c in self.contributions)

    def get_active_loans(self):
        return [loan for loan in self.loans if loan.status == 'Active']

    def get_loan_balance(self):
        return sum(
            loan.amount - sum(r.amount for r in loan.repayments)
            for loan in self.loans if loan.status == 'Active'
        )

    def get_net_worth(self):
        return self.share_balance - self.get_loan_balance()

    def __repr__(self):
        return f"<Member {self.id}: {self.name}>"
