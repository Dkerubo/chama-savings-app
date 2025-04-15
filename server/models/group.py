from sqlalchemy_serializer import SerializerMixin
from database import db

class Group(db.Model, SerializerMixin):
    """
    Group Model: Represents savings groups within the Chama
    """
    __tablename__ = 'groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    monthly_target = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    members = db.relationship(
        'Member',
        secondary='member_group',
        back_populates='groups',
        lazy='dynamic'
    )
    loans = db.relationship('Loan', back_populates='group')
    contributions = db.relationship('Contribution', back_populates='group')
    investments = db.relationship('Investment', back_populates='group')
    

    def get_total_savings(self):
        return sum(contribution.amount for contribution in self.contributions)

    def get_active_loans(self):
        return [loan for loan in self.loans if loan.status == 'Active']

    def __repr__(self):
        return f"<Group {self.name}>"