from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from app.extensions import db, migrate, socketio
from app.errors import register_error_handlers

def create_app():
    """Application factory function"""
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # Initialize extensions
    register_extensions(app)
    register_blueprints(app)
    register_error_handlers(app)

    return app

def register_extensions(app):
    """Register Flask extensions"""
    # CORS Configuration
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "http://127.0.0.1:5173",
                "supports_credentials": True,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        }
    )

    # Database and migration
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Authentication
    JWTManager(app)
    
    # WebSockets
    socketio.init_app(
        app,
        cors_allowed_origins="http://127.0.0.1:5173",
        logger=True,
        engineio_logger=True
    )

    # Import models to register with SQLAlchemy
    from app.models import (
        user, member, group, contribution, loan, loan_repayment,
        investment, investment_payment, notification, memberships,
        invitations, action_items, message_threads, goals,
        recurrence_rules, meetings
    )

def register_blueprints(app):
    """Register Flask blueprints with consistent URL prefixes"""
    blueprints = [
        # Auth routes
        ('app.routes.auth', 'auth_bp', '/api/auth'),
        
        # User management
        ('app.routes.user', 'user_bp', '/api/users'),
        
        # Group management
        ('app.routes.group', 'group_bp', '/api/groups'),
        
        # Financial operations
        ('app.routes.member_routes', 'member_bp', '/api/members'),
        ('app.routes.contribution_routes', 'contribution_bp', '/api/contributions'),
        ('app.routes.loan_routes', 'loan_bp', '/api/loans'),
        ('app.routes.investment_routes', 'investment_bp', '/api/investments'),
        ('app.routes.investment_payment_routes', 'payment_bp', '/api/payments'),
        
        # Notifications and messaging
        ('app.routes.notification', 'notification_bp', '/api/notifications'),
        ('app.routes.messaging_routes', 'messaging_bp', '/api/messages'),
        
        # Group features
        ('app.routes.membership_routes', 'membership_bp', '/api/memberships'),
        ('app.routes.invitations_routes', 'invitations_bp', '/api/invitations'),
        ('app.routes.action_items_routes', 'action_bp', '/api/action-items'),
        ('app.routes.goals_routes', 'goals_bp', '/api/goals'),
        ('app.routes.recurrence_routes', 'recurrence_bp', '/api/recurrence-rules'),
        ('app.routes.meetings_routes', 'meetings_bp', '/api/meetings')
    ]

    for module_path, bp_name, url_prefix in blueprints:
        module = __import__(module_path, fromlist=[bp_name])
        blueprint = getattr(module, bp_name)
        app.register_blueprint(blueprint, url_prefix=url_prefix)