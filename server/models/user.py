from sqlalchemy_serializer import SerializerMixin
from database import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model, SerializerMixin):
    """
    User Model: Handles system authentication and role management.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # Options: Admin, Treasurer, Member
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Foreign Key (only relevant for Member role)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'))

    # Relationships
    member = db.relationship('Member', back_populates='user', uselist=False)

    def set_password(self, password):
        """Hashes and sets the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies a password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} | Role: {self.role}>"
