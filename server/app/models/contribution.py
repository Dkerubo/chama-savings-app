from datetime import datetime
from app import db

class Contribution(db.Model):
    __tablename__ = 'contributions'

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationship: Contribution belongs to a Member
    member = db.relationship('Member', backref='contributions')

    # Serialize method to convert to dictionary
    def serialize(self):
        return {
            "id": self.id,
            "member_id": self.member_id,
            "amount": self.amount,
            "timestamp": self.timestamp,
            "note": self.note  # Including note in the serialized data
        }
