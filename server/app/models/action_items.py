from app.extensions import db
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import validates

class ActionItem(db.Model):
    __tablename__ = 'action_items'
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meetings.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    due_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='pending')  # pending, done, overdue

    meeting = db.relationship('Meeting', backref='action_items')
    assigned_to = db.relationship('User', backref='action_items')
