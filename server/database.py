# app/database.py

from flask import Flask
from .extensions import db

def init_db(app: Flask):
    """Initialize the database and create tables from models."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
