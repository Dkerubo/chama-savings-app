# app/models/loan_repayment.py

from sqlalchemy_serializer import SerializerMixin
from ..extensions import db

class LoanRepayment(db.Model, SerializerMixin):
    __tablename__ = 'loan_repayments'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, server_default=db.func.now())
    payment_method = db.Column(db.String(50))
    receipt_number = db.Column(db.String(50))
    notes = db.Column(db.Text)

    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)

    loan = db.relationship('Loan', back_populates='repayments')

    serialize_rules = ('-loan.repayments',)

    def __repr__(self):
        return f"<Repayment {self.id}: {self.amount} for Loan {self.loan_id}>"
