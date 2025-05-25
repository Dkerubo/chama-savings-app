from datetime import datetime
from server.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import re
from sqlalchemy import event

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    phone_number = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))

    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255), nullable=True)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)

    admin_groups = db.relationship('Group', back_populates='admin', cascade='all, delete-orphan')
    members = db.relationship('Member', back_populates='user', cascade='all, delete-orphan')

    def __init__(self, username=None, email=None, password=None, **kwargs):
        if username:
            self.set_username(username)
        if email:
            self.set_email(email)
        if password:
            self.set_password(password)
        for key, value in kwargs.items():
            setattr(self, key, value)
        if not self.role:
            self.role = 'member'

    def set_username(self, username):
        if not username:
            raise ValueError('Username is required')
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            raise ValueError('Username must be 3-20 characters and can include underscores')
        self.username = username

    def set_email(self, email):
        if not email:
            raise ValueError('Email is required')
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError('Invalid email format')
        self.email = email.lower()

    def set_password(self, password):
        if not password or len(password) < 8:
            raise ValueError('Password must be at least 8 characters long')
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'profile_picture': self.profile_picture
        }
        if include_sensitive:
            data.update({
                'phone_number': self.phone_number,
                'verification_token': self.verification_token,
                'reset_token': self.reset_token,
                'reset_token_expiry': (
                    self.reset_token_expiry.isoformat() if self.reset_token_expiry else None
                )
            })
        return data

    def update_last_login(self):
        self.last_login = datetime.utcnow()
        db.session.commit()

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

@event.listens_for(User, 'before_insert')
@event.listens_for(User, 'before_update')
def validate_user(mapper, connection, target):
    if not target.username:
        raise ValueError('Username is required')
    if not target.email:
        raise ValueError('Email is required')
    if not target.password_hash:
        raise ValueError('Password must be set')

@event.listens_for(User, 'after_insert')
def send_welcome_notification(mapper, connection, target):
    print(f"🎉 New user registered: {target.username}")
