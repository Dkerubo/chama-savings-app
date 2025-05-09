import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.extensions import db, migrate, socketio
from app.errors import register_error_handlers

def create_app():
    """Application factory function"""
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # Upload folder settings
    upload_folder = os.path.join(app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    app.config.update({
        'UPLOAD_FOLDER': upload_folder,
        'ALLOWED_EXTENSIONS': {'png', 'jpg', 'jpeg', 'gif'},
        'MAX_CONTENT_LENGTH': 2 * 1024 * 1024  # 2MB
    })

    # Initialize extensions and components
    register_extensions(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_root_route(app)

    return app


def register_extensions(app):
    """Register Flask extensions with proper configuration"""

    # CORS for frontend connection
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173"]}},
        supports_credentials=True
    )

    # Database and migration setup
    db.init_app(app)
    migrate.init_app(app, db)

    # JWT
    JWTManager(app)

    # WebSocket
    socketio.init_app(
        app,
        cors_allowed_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
        logger=True,
        engineio_logger=True
    )

    # Import models to register with SQLAlchemy
    from app.models import (
        user, member, group, contribution, loan, loan_repayment,
        investment, investment_payment, notification, invitations,
        action_items, message_threads, goals, recurrence_rules, meetings
    )


def register_blueprints(app):
    """Register all application blueprints"""
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.group import group_bp
    from app.routes.member_routes import member_bp
    from app.routes.contribution_routes import contribution_bp
    from app.routes.loan_routes import loan_bp
    from app.routes.investment_routes import investment_bp
    from app.routes.investment_payment_routes import payment_bp
    from app.routes.notification import notification_bp
    from app.routes.messaging_routes import messaging_bp
    from app.routes.invitations_routes import invitations_bp
    from app.routes.action_items_routes import action_bp
    from app.routes.goals_routes import goals_bp
    from app.routes.recurrence_routes import recurrence_bp
    from app.routes.meetings_routes import meetings_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(group_bp, url_prefix="/api/groups")
    app.register_blueprint(member_bp, url_prefix="/api/members")
    app.register_blueprint(contribution_bp, url_prefix="/api/contributions")
    app.register_blueprint(loan_bp, url_prefix="/api/loans")
    app.register_blueprint(investment_bp, url_prefix="/api/investments")
    app.register_blueprint(payment_bp, url_prefix="/api/payments")
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")
    app.register_blueprint(messaging_bp, url_prefix="/api/messages")
    app.register_blueprint(invitations_bp, url_prefix="/api/invitations")
    app.register_blueprint(action_bp, url_prefix="/api/action-items")
    app.register_blueprint(goals_bp, url_prefix="/api/goals")
    app.register_blueprint(recurrence_bp, url_prefix="/api/recurrence-rules")
    app.register_blueprint(meetings_bp, url_prefix="/api/meetings")


def register_root_route(app):
    """Root route showing basic API info and endpoints"""
    @app.route("/")
    def home():
        return {
            "api": {
                "version": "1.0.0",
                "status": "operational",
                "documentation": "/api/docs"
            },
            "endpoints": {
                "authentication": [
                    "POST /api/auth/login",
                    "POST /api/auth/register",
                    "GET /api/auth/me"
                ],
                "users": [
                    "GET /api/users",
                    "GET /api/users/<user_id>",
                    "PUT /api/users/<user_id>"
                ],
                "groups": [
                    "POST /api/groups",
                    "GET /api/groups",
                    "GET /api/groups/<group_id>",
                    "PUT /api/groups/<group_id>"
                ],
                "financial_services": [
                    "POST /api/contributions",
                    "GET /api/loans",
                    "PUT /api/loans/<loan_id>/approve",
                    "GET /api/investments"
                ],
                "system": [
                    "GET /api/health",
                    "GET /api/docs"
                ]
            }
        }, 200