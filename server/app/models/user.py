from datetime import datetime
from app.extensions import db
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

    # Relationships
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    admin_groups = db.relationship('Group', back_populates='admin', cascade='all, delete-orphan')
    verified_loans = db.relationship('Loan', foreign_keys='Loan.approved_by', back_populates='approver')
    members = db.relationship('Member', back_populates='user', cascade='all, delete-orphan')

    def __init__(self, username=None, email=None, password=None, **kwargs):
        """
        Initialize user with optional direct password setting.
        Use set_password() separately for better control.
        """
        if username:
            self.set_username(username)
        if email:
            self.set_email(email)
        if password:
            self.set_password(password)
            
        # Set default role if not provided
        if 'role' not in kwargs:
            kwargs['role'] = 'member'
            
        for key, value in kwargs.items():
            setattr(self, key, value)

    def set_username(self, username):
        """Validate and set username with strict rules"""
        if not username:
            raise ValueError('Username cannot be empty')
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            raise ValueError('Username must be 3-20 characters (letters, numbers, underscores)')
        if User.query.filter_by(username=username).first():
            raise ValueError('Username already exists')
        self.username = username

    def set_email(self, email):
        """Validate and normalize email"""
        if not email:
            raise ValueError('Email cannot be empty')
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError('Invalid email format')
        if User.query.filter_by(email=email.lower()).first():
            raise ValueError('Email already registered')
        self.email = email.lower()

    def set_role(self, role):
        """Validate and set user role"""
        valid_roles = ['member', 'admin', 'superadmin']
        if role not in valid_roles:
            raise ValueError(f"Role must be one of: {', '.join(valid_roles)}")
        self.role = role

    def set_password(self, password):
        """Hash and store password with validation"""
        if not password:
            raise ValueError('Password cannot be empty')
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters')
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password_hash, password)

    def get_token(self, additional_claims=None):
        """Generate JWT token for this user"""
        claims = {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'email': self.email
        }
        if additional_claims:
            claims.update(additional_claims)
        return create_access_token(identity=claims)

    def serialize(self, include_sensitive=False):
        """Convert user to dictionary for JSON responses"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'profile_picture': self.profile_picture
        }
        if include_sensitive:
            data['phone_number'] = self.phone_number
        return data

    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def has_group_permission(self, group_id, required_role='admin'):
        """Check if user has permissions for a specific group"""
        if self.role == 'superadmin':
            return True
        return any(
            m for m in self.members
            if m.group_id == group_id and (m.is_admin or m.status == required_role)
        )

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


# Event listeners
@event.listens_for(User, 'before_insert')
@event.listens_for(User, 'before_update')
def validate_user(mapper, connection, target):
    """Validate user before saving to database"""
    if not target.username:
        raise ValueError('Username is required')
    if not target.email:
        raise ValueError('Email is required')
    if not target.password_hash:
        raise ValueError('Password must be set')

@event.listens_for(User, 'after_insert')
def send_welcome_notification(mapper, connection, target):
    """Trigger welcome notification after user creation"""
    # In production, you would implement actual notification logic here
    print(f"New user registered: {target.username}")
    # Example: create_welcome_notification(target.id)