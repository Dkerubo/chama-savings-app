from datetime import datetime
from app import db

class Group(db.Model):
    __tablename__ = 'groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # A group has many users (members)
    members = db.relationship('User', back_populates='group', foreign_keys='User.group_id', lazy='dynamic')
    admin = db.relationship('User', foreign_keys=[admin_id], backref='admin_of_group')

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "admin_id": self.admin_id
        }
