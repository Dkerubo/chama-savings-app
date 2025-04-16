from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from database import db

class Loan(db.Model, SerializerMixin):
    __tablename__ = 'loans'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False)
    purpose = db.Column(db.String(200))
    issue_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='Pending')  # Pending, Approved, Active, Paid, Defaulted
    repayment_amount = db.Column(db.Float)
    notes = db.Column(db.Text)

    # Foreign Keys
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    guarantor_id = db.Column(db.Integer, db.ForeignKey('members.id'))
    approved_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationships
    member = db.relationship('Member', foreign_keys=[member_id], back_populates='loans')
    group = db.relationship('Group', back_populates='loans')
    guarantor = db.relationship('Member', foreign_keys=[guarantor_id])
    repayments = db.relationship('LoanRepayment', back_populates='loan', cascade='all, delete-orphan')
    approved_by = db.relationship('User')

    serialize_rules = ('-member.loans', '-group.loans', '-guarantor.loans', 
                      '-repayments.loan', '-approved_by.member')

    def calculate_repayment(self):
        interest = self.amount * (self.interest_rate / 100)
        self.repayment_amount = self.amount + interest
        return self.repayment_amount

    def get_balance(self):
        return self.repayment_amount - sum(r.amount for r in self.repayments)

    def __repr__(self):
        return f"<Loan {self.id}: {self.amount}@{self.interest_rate}%>"