from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.sql import func
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class Member(db.Model, SerializerMixin):
    """
    Member Model: Represents members of the Chama savings group.
    - Tracks member details and savings information.
    - Manages relationships with groups, loans, and contributions.
    """
    __tablename__ = 'members'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    national_id = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(128))
    joined_date = db.Column(db.DateTime, server_default=func.now())
    status = db.Column(db.String(20), default='Active')  # Active, Inactive, Suspended
    
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
        uselist=False
    )

    # Password hashing for member portal access
    def set_password(self, password):
        """Hashes and sets the member's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies the provided password against the stored hash."""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def get_total_contributions(self):
        """Returns the total amount contributed by this member"""
        return sum(contribution.amount for contribution in self.contributions)

    def get_active_loans(self):
        """Returns all active loans for this member"""
        return [loan for loan in self.loans if loan.status == 'Active']

    def serialize(self):
        """Custom serialization including relationships"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'joined_date': self.joined_date.isoformat(),
            'status': self.status,
            'total_contributions': self.get_total_contributions(),
            'active_loans': len(self.get_active_loans()),
            'groups': [group.name for group in self.groups]
        }

    def __repr__(self):
        return f"<Member {self.id}: {self.name}>"


# Association table for many-to-many relationship between members and groups
member_group = db.Table(
    'member_group',
    db.Column('member_id', db.Integer, db.ForeignKey('members.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True)
)