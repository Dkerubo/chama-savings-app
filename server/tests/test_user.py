# tests/test_user.py

import pytest
from app.models.user import User
from werkzeug.security import check_password_hash
from datetime import datetime

def test_create_user(db_session):
    user = User(username="testuser", email="test@example.com", password="strongpassword123")
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.is_active
    assert check_password_hash(user.password_hash, "strongpassword123")
    assert isinstance(user.created_at, datetime)

def test_password_hashing(db_session):
    user = User(username="hashuser", email="hash@example.com", password="secret123")
    db_session.add(user)
    db_session.commit()

    assert user.check_password("secret123") is True
    assert user.check_password("wrongpass") is False

def test_token_generation(db_session):
    user = User(username="tokenuser", email="token@example.com", password="tokenpass")
    db_session.add(user)
    db_session.commit()

    token = user.get_token()
    assert isinstance(token, str)
    assert len(token) > 0

def test_invalid_username_raises_error(db_session):
    with pytest.raises(ValueError):
        user = User(username="bad!", email="baduser@example.com", password="validpass123")
        db_session.add(user)
        db_session.commit()

def test_invalid_email_raises_error(db_session):
    with pytest.raises(ValueError):
        user = User(username="gooduser", email="not-an-email", password="validpass123")
        db_session.add(user)
        db_session.commit()

def test_invalid_role_raises_error(db_session):
    user = User(username="roleuser", email="role@example.com", password="rolepass")
    db_session.add(user)
    db_session.commit()

    with pytest.raises(ValueError):
        user.role = "hacker"
        db_session.commit()

def test_short_password_raises_error():
    with pytest.raises(ValueError):
        User(username="shortpass", email="short@example.com", password="123")

def test_user_serialization(db_session):
    user = User(username="serialuser", email="serial@example.com", password="serialpass")
    db_session.add(user)
    db_session.commit()

    data = user.serialize()
    assert 'id' in data
    assert data['username'] == "serialuser"
    assert 'email' in data
    assert 'created_at' in data
