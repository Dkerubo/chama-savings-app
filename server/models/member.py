from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.sql import func
from database import db


class Member(db.Model, SerializerMixin):
    """
    Member Model: Represents members of the Chama savings group.
    - Stores member personal and financial information
    - Manages relationships with groups, loans, and contributions
    - Integrates with User model for authentication
    """
    __tablename__ = 'members'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    national_id = db.Column(db.String(20), unique=True)
    joined_date = db.Column(db.DateTime, server_default=func.now())
    status = db.Column(db.String(20), default='Active')  # Active, Inactive, Suspended
    share_balance = db.Column(db.Float, default=0.0)
    next_of_kin = db.Column(db.String(100))
    next_of_kin_contact = db.Column(db.String(20))

    # Relationships
    groups = db.relationship(
        'Group',
        secondary='member_group',
        back_populates='members',
        lazy='dynamic'
    )

    loans = db.relationship(
        'Loan',
        back_populates='member',
        lazy='dynamic'
    )

    contributions = db.relationship(
        'Contribution',
        back_populates='member',
        lazy='dynamic'
    )

    user = db.relationship(
        'User',
        back_populates='member',
        uselist=False,
        cascade='all, delete-orphan'
    )

    approved_investments = db.relationship(
        'Investment',
        back_populates='approved_by'
    )

    # Financial Calculations
    def get_total_contributions(self):
        """Returns the total amount contributed by this member."""
        return sum(c.amount for c in self.contributions)

    def get_active_loans(self):
        """Returns all active loans for this member."""
        return [loan for loan in self.loans if loan.status == 'Active']

    def get_loan_balance(self):
        """Returns total outstanding loan balance."""
        return sum(
            loan.amount - sum(r.amount for r in loan.repayments)
            for loan in self.loans
            if loan.status == 'Active'
        )

    def get_net_worth(self):
        """Calculates member's net worth in the Chama."""
        return self.share_balance - self.get_loan_balance()

    # Serialization
    def serialize(self):
        """Custom serialization for API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'status': self.status,
            'share_balance': self.share_balance,
            'net_worth': self.get_net_worth(),
            'total_contributions': self.get_total_contributions(),
            'active_loans_count': self.loans.filter_by(status='Active').count(),
            'groups': [group.name for group in self.groups],
            'has_user_account': self.user is not None
        }

    def minimal_serialize(self):
        """Lightweight serialization for dropdowns/lists."""
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone
        }

    def __repr__(self):
        return f"<Member {self.id}: {self.name}>"


# Association table for many-to-many relationship between members and groups
member_group = db.Table(
    'member_group',
    db.Column('member_id', db.Integer, db.ForeignKey('members.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True),
    db.Column('date_joined', db.DateTime, server_default=func.now()),
    db.Column('is_active', db.Boolean, default=True)
)
