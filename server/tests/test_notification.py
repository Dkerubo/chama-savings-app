# tests/test_notification.py

import pytest
from app.models.user import User
from app.models.notification import Notification, NotificationType
from datetime import datetime

def test_create_notification(db_session):
    user = User(username="notifuser", email="notif@example.com", password="notifpass")
    db_session.add(user)
    db_session.commit()

    notification = Notification(
        user_id=user.id,
        title="Test Notification",
        message="This is a test notification",
        notification_type=NotificationType.SYSTEM
    )
    db_session.add(notification)
    db_session.commit()

    assert notification.id is not None
    assert notification.is_read is False
    assert isinstance(notification.created_at, datetime)
    assert notification.notification_type == NotificationType.SYSTEM.value

def test_mark_notification_as_read(db_session):
    user = User(username="readuser", email="read@example.com", password="readpass")
    db_session.add(user)
    db_session.commit()

    notification = Notification.create_for_user(
        user_id=user.id,
        title="Read Test",
        message="Please read this notification",
        notification_type=NotificationType.GROUP
    )
    db_session.commit()

    assert notification.is_read is False
    assert notification.read_at is None

    notification.mark_as_read()
    db_session.commit()

    assert notification.is_read is True
    assert notification.read_at is not None

def test_notification_serialization(db_session):
    user = User(username="serialnotif", email="serialnotif@example.com", password="serialnotifpass")
    db_session.add(user)
    db_session.commit()

    notification = Notification(
        user_id=user.id,
        title="Serialize Me",
        message="Serialization Test",
        notification_type=NotificationType.CONTRIBUTION
    )
    db_session.add(notification)
    db_session.commit()

    data = notification.serialize()

    assert data['id'] == notification.id
    assert data['title'] == "Serialize Me"
    assert data['is_read'] is False
    assert data['notification_type'] == NotificationType.CONTRIBUTION.value
    assert 'created_at' in data
    assert 'time_ago' in data
