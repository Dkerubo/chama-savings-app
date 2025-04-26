from app.extensions import db
from sqlalchemy import event, func
from datetime import datetime
from enum import Enum
from app import socketio  # Import SocketIO instance

class NotificationType(Enum):
    """Enum for different notification types."""
    CONTRIBUTION = 'contribution'
    LOAN = 'loan'
    INVESTMENT = 'investment'
    GROUP = 'group'
    SYSTEM = 'system'
    PAYMENT = 'payment'
    REMINDER = 'reminder'

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    read_at = db.Column(db.DateTime)
    notification_type = db.Column(db.String(20), nullable=False)
    related_entity_type = db.Column(db.String(50))
    related_entity_id = db.Column(db.Integer)
    priority = db.Column(db.Integer, default=1)  # 1=normal, 2=important, 3=urgent

    # Relationships
    user = db.relationship('User', back_populates='notifications')
    
    __table_args__ = (
        db.Index('idx_notification_user_read', 'user_id', 'is_read'),  # Index for faster querying
    )
    
    def __init__(self, user_id, title, message, notification_type, **kwargs):
        self.user_id = user_id
        self.title = title
        self.message = message
        self.notification_type = notification_type.value if isinstance(notification_type, NotificationType) else notification_type
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def mark_as_read(self):
        """Mark notification as read and set read_at timestamp."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
    
    def serialize(self):
        """Return notification data in serializable format."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'notification_type': self.notification_type,
            'related_entity_type': self.related_entity_type,
            'related_entity_id': self.related_entity_id,
            'priority': self.priority,
            'time_ago': self.get_time_ago()
        }
    
    def get_time_ago(self):
        """Return human-readable time since creation."""
        delta = datetime.utcnow() - self.created_at
        if delta.days > 0:
            return f"{delta.days} day{'s' if delta.days != 1 else ''} ago"
        elif delta.seconds >= 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif delta.seconds >= 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        else:
            return "Just now"
    
    @classmethod
    def create_for_user(cls, user_id, title, message, notification_type, **kwargs):
        """Helper to create and add notification to DB."""
        notification = cls(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            **kwargs
        )
        db.session.add(notification)
        return notification
    
    def __repr__(self):
        return (f'<Notification {self.id} for User {self.user_id}, '
                f'Type: {self.notification_type}, Read: {self.is_read}>')

# Event listeners
@event.listens_for(Notification, 'after_insert')
def after_notification_insert(mapper, connection, target):
    """Triggered after a notification is created."""
    data = {
        'id': target.id,
        'user_id': target.user_id,
        'title': target.title,
        'message': target.message,
        'created_at': target.created_at.isoformat(),
        'notification_type': target.notification_type,
        'priority': target.priority
    }
    socketio.emit('new_notification', data, namespace='/notifications')
    print(f"New notification emitted for user {target.user_id}")

@event.listens_for(Notification, 'before_update')
def before_notification_update(mapper, connection, target):
    """Update read_at timestamp when marked as read."""
    if target.is_read and not target.read_at:
        target.read_at = datetime.utcnow()
