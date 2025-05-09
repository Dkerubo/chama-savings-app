from datetime import datetime
from app.extensions import db
from sqlalchemy import event

class JoinRequest(db.Model):
    __tablename__ = 'join_requests'
    __table_args__ = {'extend_existing': True}  # Prevents table redefinition errors

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending/approved/rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    processed_at = db.Column(db.DateTime)
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Admin who processed the request

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='join_requests')
    group = db.relationship('Group', backref='join_requests')
    processor = db.relationship('User', foreign_keys=[processed_by])

    def __init__(self, user_id, group_id, message=None, status='pending'):
        self.user_id = user_id
        self.group_id = group_id
        self.message = message
        self.status = status

    def approve(self, processed_by_user_id):
        """Approve the join request"""
        if self.status != 'pending':
            raise ValueError("Only pending requests can be approved")
        
        self.status = 'approved'
        self.processed_at = datetime.utcnow()
        self.processed_by = processed_by_user_id

    def reject(self, processed_by_user_id, reason=None):
        """Reject the join request with optional reason"""
        if self.status != 'pending':
            raise ValueError("Only pending requests can be rejected")
        
        self.status = 'rejected'
        self.processed_at = datetime.utcnow()
        self.processed_by = processed_by_user_id
        if reason:
            self.message = f"Rejection reason: {reason}\nOriginal message: {self.message}"

    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'group_id': self.group_id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'processed_by': self.processed_by,
            'user': {
                'id': self.user.id,
                'username': self.user.username
            } if self.user else None,
            'group': {
                'id': self.group.id,
                'name': self.group.name
            } if self.group else None,
            'processor': {
                'id': self.processor.id,
                'username': self.processor.username
            } if self.processor else None
        }

    def __repr__(self):
        return f'<JoinRequest {self.id} - User {self.user_id} to Group {self.group_id} ({self.status})>'

# Event listeners
@event.listens_for(JoinRequest, 'after_update')
def after_join_request_update(mapper, connection, target):
    """Trigger actions after a join request is updated"""
    if target.status == 'approved':
        print(f"Join request {target.id} approved. User {target.user_id} added to group {target.group_id}")
    elif target.status == 'rejected':
        print(f"Join request {target.id} rejected. Notifying user {target.user_id}")