from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from sqlalchemy import event, func
from sqlalchemy.orm import validates
import re

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member')
    created_at = db.Column(db.DateTime, server_default=func.now())
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    phone_number = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))

    # Relationships
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    memberships = db.relationship('Member', back_populates='user', cascade='all, delete-orphan')
    admin_groups = db.relationship('Group', back_populates='admin', cascade='all, delete-orphan')
    verified_loans = db.relationship('Loan', foreign_keys='Loan.approved_by', back_populates='approver')

    def __init__(self, username, email, password, **kwargs):
        self.username = username
        self.email = email.lower()
        self.set_password(password)
        for key, value in kwargs.items():
            setattr(self, key, value)

    # Validation methods
    @validates('username')
    def validate_username(self, key, username):
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            raise ValueError('Username must be 3-20 characters (letters, numbers, underscores)')
        return username

    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError('Invalid email format')
        return email.lower()

    @validates('role')
    def validate_role(self, key, role):
        valid_roles = ['member', 'admin', 'superadmin']
        if role not in valid_roles:
            raise ValueError(f"Role must be: {', '.join(valid_roles)}")
        return role

    # Auth methods
    def set_password(self, password):
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters')
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_token(self, additional_claims=None):
        claims = {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }
        if additional_claims:
            claims.update(additional_claims)
        return create_access_token(identity=claims)

    # Serialization methods
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'profile_picture': self.profile_picture
        }

    def get_jwt_identity(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }

    # Utility methods
    def update_last_login(self):
        self.last_login = datetime.utcnow()
        db.session.commit()

    def has_group_permission(self, group_id, required_role='admin'):
        if self.role == 'superadmin':
            return True
        return any(
            m for m in self.memberships
            if m.group_id == group_id and (m.is_admin or m.status == required_role)
        )

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

# Event listeners
@event.listens_for(User, 'before_insert')
def validate_user_before_insert(mapper, connection, target):
    if not target.username or not target.email:
        raise ValueError('Username and email are required')

@event.listens_for(User, 'after_insert')
def send_welcome_email(mapper, connection, target):
    print(f"New user registered: {target.username}")