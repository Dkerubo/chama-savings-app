from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import datetime
from sqlalchemy import event, func
from sqlalchemy.orm import validates
import re

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member')  # 'member', 'admin', 'superadmin'
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    phone_number = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))  # URL to profile picture
    
    # Relationships
    memberships = db.relationship('Member', back_populates='user', cascade='all, delete-orphan')
    admin_groups = db.relationship('Group', back_populates='admin', cascade='all, delete-orphan')
    verified_loans = db.relationship('Loan', foreign_keys='Loan.approved_by', back_populates='approver')
    
    def __init__(self, username, email, password, **kwargs):
        self.username = username
        self.email = email
        self.set_password(password)
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    @validates('username')
    def validate_username(self, key, username):
        """Validate username format"""
        if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
            raise ValueError('Username must be 3-20 characters (letters, numbers, underscores)')
        return username
    
    @validates('email')
    def validate_email(self, key, email):
        """Validate email format"""
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError('Invalid email address format')
        return email.lower()  # Store emails in lowercase
    
    @validates('role')
    def validate_role(self, key, role):
        """Validate role value"""
        valid_roles = ['member', 'admin', 'superadmin']
        if role not in valid_roles:
            raise ValueError(f'Invalid role. Must be one of: {valid_roles}')
        return role
    
    def set_password(self, password):
        """Hash and store password"""
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters')
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def get_token(self, additional_claims=None):
        """Generate JWT access token"""
        claims = {
            'id': self.id,
            'role': self.role,
            'username': self.username
        }
        if additional_claims:
            claims.update(additional_claims)
        return create_access_token(identity=claims)
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def serialize(self, include_sensitive=False):
        """Return user data in serializable format"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'membership_count': len(self.memberships),
            'admin_group_count': len(self.admin_groups)
        }
        if include_sensitive:
            data.update({
                'phone_number': self.phone_number,
                'memberships': [m.serialize() for m in self.memberships]
            })
        return data
    
    def has_group_permission(self, group_id, required_role='admin'):
        """Check if user has permissions for a specific group"""
        if self.role == 'superadmin':
            return True
        return any(m for m in self.memberships 
                 if m.group_id == group_id and 
                 (m.is_admin or m.status == required_role))
    
    def __repr__(self):
        return f'<User {self.username} (ID: {self.id}, Role: {self.role})>'

# Event listeners
@event.listens_for(User, 'before_insert')
def before_user_insert(mapper, connection, target):
    """Validate data before insert"""
    if not target.username or not target.email:
        raise ValueError('Username and email are required')

@event.listens_for(User, 'after_insert')
def after_user_insert(mapper, connection, target):
    """Trigger welcome email after registration"""
    print(f"New user registered: {target.username} ({target.email})")