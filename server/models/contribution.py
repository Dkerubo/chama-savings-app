from sqlalchemy_serializer import SerializerMixin
from database import db

class Contribution(db.Model, SerializerMixin):
    __tablename__ = 'contributions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, server_default=db.func.now())
    payment_method = db.Column(db.String(50))
    receipt_number = db.Column(db.String(50))
    notes = db.Column(db.Text)

    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    recorded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    member = db.relationship('Member', back_populates='contributions')
    group = db.relationship('Group', back_populates='contributions')
    recorded_by = db.relationship('User')

    serialize_rules = ('-member.contributions', '-group.contributions', '-recorded_by.member')

    def __repr__(self):
        return f"<Contribution {self.id}: {self.amount} by Member {self.member_id}>"
