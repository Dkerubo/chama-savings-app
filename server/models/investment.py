from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from database import db

class Investment(db.Model, SerializerMixin):
    __tablename__ = 'investments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    amount_invested = db.Column(db.Float, nullable=False)
    date_invested = db.Column(db.DateTime, default=datetime.utcnow)
    expected_return = db.Column(db.Float)  # ROI %
    maturity_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Active')  # Active, Matured, Liquidated, Defaulted
    risk_level = db.Column(db.String(20))  # Low, Medium, High
    notes = db.Column(db.Text)

    # Foreign Keys
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('members.id'))

    # Relationships
    group = db.relationship('Group', back_populates='investments')
    approved_by = db.relationship('Member', back_populates='approved_investments')
    returns = db.relationship('InvestmentReturn', back_populates='investment', cascade='all, delete-orphan')
    documents = db.relationship('InvestmentDocument', back_populates='investment', cascade='all, delete-orphan')

    serialize_rules = (
        '-group.investments', '-approved_by.approved_investments',
        '-returns.investment', '-documents.investment'
    )

    def calculate_current_value(self):
        total_returns = sum(r.amount for r in self.returns)
        return self.amount_invested + total_returns

    def days_to_maturity(self):
        return (self.maturity_date - datetime.utcnow()).days if self.maturity_date else None

    def __repr__(self):
        return f"<Investment {self.id}: {self.name} ({self.status})>"

class InvestmentReturn(db.Model, SerializerMixin):
    __tablename__ = 'investment_returns'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    return_date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(200))
    recorded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)

    investment = db.relationship('Investment', back_populates='returns')
    recorded_by = db.relationship('User')

    serialize_rules = ('-investment.returns', '-recorded_by.member')

    def __repr__(self):
        return f"<Return {self.id}: {self.amount} from Investment {self.investment_id}>"

class InvestmentDocument(db.Model, SerializerMixin):
    __tablename__ = 'investment_documents'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    upload_date = db.Column(db.DateTime, server_default=db.func.now())
    document_type = db.Column(db.String(50))  # Contract, Report, Receipt
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)

    investment = db.relationship('Investment', back_populates='documents')
    uploaded_by = db.relationship('User')

    serialize_rules = ('-investment.documents', '-uploaded_by.member')

    def __repr__(self):
        return f"<Document {self.id}: {self.name} for Investment {self.investment_id}>"
