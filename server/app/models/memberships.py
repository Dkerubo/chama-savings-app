from app.extensions import db
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import validates

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # e.g., Admin, Treasurer, Member
    description = db.Column(db.String(255))


class Membership(db.Model):
    __tablename__ = 'memberships'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    group = db.relationship('Group', backref='memberships')
    user = db.relationship('User', backref='memberships')
    role = db.relationship('Role', backref='members')
