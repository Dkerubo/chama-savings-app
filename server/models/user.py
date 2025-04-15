from sqlalchemy_serializer import SerializerMixin
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, SerializerMixin):
    """
    User Model: Handles system authentication
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # Admin, Treasurer, Member
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Foreign Key (for member users)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'))
    
    # Relationship
    member = db.relationship('Member', back_populates='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"