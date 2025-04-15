from sqlalchemy_serializer import SerializerMixin
from database import db

class LoanRepayment(db.Model, SerializerMixin):
    """
    LoanRepayment Model: Tracks loan repayments
    """
    __tablename__ = 'loan_repayments'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, server_default=db.func.now())
    payment_method = db.Column(db.String(50))
    
    # Foreign Key
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    
    # Relationship
    loan = db.relationship('Loan', back_populates='repayments')

    def __repr__(self):
        return f"<Repayment {self.id}: {self.amount} for Loan {self.loan_id}>"