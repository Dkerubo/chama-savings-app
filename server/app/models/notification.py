from datetime import datetime
from enum import Enum
from flask import current_app
from sqlalchemy import event, func
from .notification_type import NotificationType

from app.extensions import db, socketio


class NotificationType(Enum):
    """Enumeration of notification types."""
    CONTRIBUTION = 'contribution'
    LOAN = 'loan'
    INVESTMENT = 'investment'
    GROUP = 'group'
    SYSTEM = 'system'
    PAYMENT = 'payment'
    REMINDER = 'reminder'


class Notification(db.Model):
    """Model representing user notifications."""
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(
        db.DateTime, 
        server_default=func.now(), 
        nullable=False
    )
    read_at = db.Column(db.DateTime)
    notification_type = db.Column(db.String(20), nullable=False)
    related_entity_type = db.Column(db.String(50))
    related_entity_id = db.Column(db.Integer)
    priority = db.Column(db.Integer, default=1)  # 1=normal, 2=important, 3=urgent

    # Relationships
    user = db.relationship('User', back_populates='notifications')

    __table_args__ = (
        db.Index('idx_notification_user_read', 'user_id', 'is_read'),
    )

    def __init__(self, user_id, title, message, notification_type, **kwargs):
        """
        Initialize a new Notification.
        
        Args:
            user_id: ID of the recipient user
            title: Notification title
            message: Notification message content
            notification_type: Type of notification (NotificationType enum or string)
            **kwargs: Additional notification attributes
        """
        self.user_id = user_id
        self.title = title
        self.message = message
        self.notification_type = (
            notification_type.value 
            if isinstance(notification_type, NotificationType) 
            else notification_type
        )
        for key, value in kwargs.items():
            setattr(self, key, value)

    def mark_as_read(self):
        """Mark the notification as read with current timestamp."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def serialize(self):
        """Convert notification to dictionary for serialization."""
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
        """Get human-readable time since notification was created."""
        delta = datetime.utcnow() - self.created_at
        
        if delta.days > 0:
            unit = 'day' if delta.days == 1 else 'days'
            return f"{delta.days} {unit} ago"
        if delta.seconds >= 3600:
            hours = delta.seconds // 3600
            unit = 'hour' if hours == 1 else 'hours'
            return f"{hours} {unit} ago"
        if delta.seconds >= 60:
            minutes = delta.seconds // 60
            unit = 'minute' if minutes == 1 else 'minutes'
            return f"{minutes} {unit} ago"
        return "Just now"

    @classmethod
    def create_for_user(cls, user_id, title, message, notification_type, **kwargs):
        """
        Create and persist a new notification for a user.
        
        Returns:
            The created Notification instance
        """
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
        return (
            f"<Notification {self.id} for User {self.user_id}, "
            f"Type: {self.notification_type}, Read: {self.is_read}>"
        )


def _emit_notification(target):
    """Helper function to emit notification via socketio."""
    if not hasattr(current_app, 'socketio') or current_app.config.get('DISABLE_SOCKETIO'):
        return

    data = {
        'id': target.id,
        'user_id': target.user_id,
        'title': target.title,
        'message': target.message,
        'created_at': target.created_at.isoformat(),
        'notification_type': target.notification_type,
        'priority': target.priority,
        'is_read': target.is_read
    }
    
    try:
        current_app.socketio.emit(
            'new_notification', 
            data, 
            namespace='/notifications',
            to=f'user_{target.user_id}'  # Send only to specific user
        )
    except Exception as e:
        current_app.logger.error(f"Failed to emit notification: {str(e)}")


@event.listens_for(Notification, 'after_insert')
def emit_notification_after_insert(mapper, connection, target):
    """Emit socket.io event when new notification is created."""
    _emit_notification(target)
    current_app.logger.info(f"New notification for user {target.user_id}")


@event.listens_for(Notification, 'before_update')
def set_read_at_before_update(mapper, connection, target):
    """Update read_at timestamp when notification is marked as read."""
    if target.is_read and not target.read_at:
        target.read_at = datetime.utcnow()
        _emit_notification(target)  # Emit update when read status changes