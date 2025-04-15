from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from database import db

class Investment(db.Model, SerializerMixin):
    """
    Investment Model: Tracks group investments and their returns
    """
    __tablename__ = 'investments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Real Estate", "Treasury Bonds"
    description = db.Column(db.Text)
    amount_invested = db.Column(db.Float, nullable=False)
    date_invested = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expected_return = db.Column(db.Float)  # Expected ROI percentage
    maturity_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Active')  # Active, Matured, Liquidated, Defaulted
    risk_level = db.Column(db.String(20))  # Low, Medium, High
    
    # Foreign Keys
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('members.id'))  # Who approved this investment
    
    # Relationships
    group = db.relationship('Group', back_populates='investments')
    approved_by = db.relationship('Member')
    returns = db.relationship('InvestmentReturn', back_populates='investment')
    documents = db.relationship('InvestmentDocument', back_populates='investment')

    def calculate_current_value(self):
        """Calculate current value based on returns"""
        total_returns = sum(r.amount for r in self.returns)
        return self.amount_invested + total_returns

    def days_to_maturity(self):
        if self.maturity_date:
            return (self.maturity_date - datetime.utcnow()).days
        return None

    def __repr__(self):
        return f"<Investment {self.id}: {self.name} ({self.status})>"


class InvestmentReturn(db.Model, SerializerMixin):
    """
    InvestmentReturn Model: Tracks returns from investments
    """
    __tablename__ = 'investment_returns'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    return_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.String(200))
    
    # Foreign Key
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    
    # Relationship
    investment = db.relationship('Investment', back_populates='returns')

    def __repr__(self):
        return f"<Return {self.id}: {self.amount} from Investment {self.investment_id}>"


class InvestmentDocument(db.Model, SerializerMixin):
    """
    InvestmentDocument Model: Stores documents related to investments
    """
    __tablename__ = 'investment_documents'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    upload_date = db.Column(db.DateTime, server_default=db.func.now())
    document_type = db.Column(db.String(50))  # Contract, Report, Receipt
    
    # Foreign Key
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    
    # Relationship
    investment = db.relationship('Investment', back_populates='documents')

    def __repr__(self):
        return f"<Document {self.id}: {self.name} for Investment {self.investment_id}>"