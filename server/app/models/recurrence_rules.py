from app.extensions import db
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import validates

class RecurrenceRule(db.Model):
    __tablename__ = 'recurrence_rules'
    id = db.Column(db.Integer, primary_key=True)
    entity_type = db.Column(db.String(50))  # 'contribution', 'meeting', etc.
    entity_id = db.Column(db.Integer)
    frequency = db.Column(db.String(20))  # daily, weekly, monthly
    interval = db.Column(db.Integer, default=1)
    end_date = db.Column(db.Date)
