from app.extensions import db
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import validates

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    target_amount = db.Column(db.Float, nullable=False)
    achieved_amount = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.Date)
    status = db.Column(db.String(20), default='ongoing')  # ongoing, completed, failed

    group = db.relationship('Group', backref='goals')
