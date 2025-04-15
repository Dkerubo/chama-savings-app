from sqlalchemy_serializer import SerializerMixin
from database import db

class Contribution(db.Model, SerializerMixin):
    """
    Contribution Model: Tracks member contributions to the Chama
    """
    __tablename__ = 'contributions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, server_default=db.func.now())
    payment_method = db.Column(db.String(50))  # M-Pesa, Bank Transfer, Cash
    receipt_number = db.Column(db.String(50))
    
    # Foreign Keys
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    
    # Relationships
    member = db.relationship('Member', back_populates='contributions')
    group = db.relationship('Group', back_populates='contributions')

    def __repr__(self):
        return f"<Contribution {self.id}: {self.amount} by Member {self.member_id}>"