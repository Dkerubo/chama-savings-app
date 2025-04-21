from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy_serializer import SerializerMixin
from database import db
from datetime import datetime
import bcrypt

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Member')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    profile_picture = db.Column(db.String(255))  # URL to profile picture

    # Relationships
    member = db.relationship('Member', back_populates='user', uselist=False, cascade='all, delete-orphan')

    # Serialization rules
    serialize_rules = (
        '-password_hash', 
        '-member.user',
        '-created_at',
    )

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

    def set_password(self, password):
        """Hash and set the user's password"""
        if not password:
            raise ValueError("Password cannot be empty")
        self.password_hash = generate_password_hash(password)
        # Also set with bcrypt for backward compatibility
        self._set_bcrypt_password(password)

    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        if not password:
            return False
        # Try werkzeug check first
        if check_password_hash(self.password_hash, password):
            return True
        # Fallback to bcrypt check for legacy users
        return self._check_bcrypt_password(password)

    def _set_bcrypt_password(self, raw_password):
        """BCrypt password hashing (for legacy support)"""
        self._bcrypt_hash = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def _check_bcrypt_password(self, raw_password):
        """BCrypt password verification (for legacy support)"""
        if not hasattr(self, '_bcrypt_hash') or not self._bcrypt_hash:
            return False
        try:
            return bcrypt.checkpw(
                raw_password.encode('utf-8'), 
                self._bcrypt_hash.encode('utf-8')
            )
        except (ValueError, AttributeError):
            return False

    def get_public_profile(self):
        """Return safe user data for public viewing"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'member_id': self.member.id if self.member else None
        }

    def deactivate(self):
        """Deactivate user account"""
        self.is_active = False
        return self

    def activate(self):
        """Activate user account"""
        self.is_active = True
        return self

    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        return self