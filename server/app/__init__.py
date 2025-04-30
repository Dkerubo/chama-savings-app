from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

from app.extensions import db, migrate, socketio
from app.errors import register_error_handlers

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    
    # Enable CORS for frontend access with credentials
def register_extensions(app):
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

    # Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)
    CORS(app, resources={r"/*": {"origins": "*"}})
    socketio.init_app(app, cors_allowed_origins="*")



    # Import models to register with SQLAlchemy metadata
    from app.models import (
        user, member, group, contribution, loan, loan_repayment,
        investment, investment_payment, notification, memberships,
        invitations, action_items, message_threads, goals,
        recurrence_rules, meetings
    )
    target_metadata = db.metadata

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.group import group_bp
    from app.routes.user import user_bp
    from app.routes.member_routes import member_bp
    from app.routes.contribution_routes import contribution_bp
    from app.routes.loan_routes import loan_bp
    from app.routes.investment_routes import investment_bp
    from app.routes.investment_payment_routes import payment_bp
    from app.routes.notification import notification_bp
    from app.routes.membership_routes import membership_bp
    from app.routes.invitations_routes import invitations_bp
    from app.routes.action_items_routes import action_bp
    from app.routes.messaging_routes import messaging_bp
    from app.routes.goals_routes import goals_bp
    from app.routes.recurrence_routes import recurrence_bp
    from app.routes.meetings_routes import meetings_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(group_bp, url_prefix='/api/groups')
    app.register_blueprint(member_bp, url_prefix='/api/members')
    app.register_blueprint(contribution_bp, url_prefix='/api/contributions')
    app.register_blueprint(loan_bp, url_prefix='/api/loans')
    app.register_blueprint(investment_bp, url_prefix='/api/investments')
    app.register_blueprint(payment_bp, url_prefix='/api')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(membership_bp, url_prefix='/api/membership')
    app.register_blueprint(invitations_bp, url_prefix='/api/invitations')
    app.register_blueprint(action_bp, url_prefix='/api/actions')
    app.register_blueprint(messaging_bp, url_prefix='/api/messages')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(recurrence_bp, url_prefix='/api/recurrence')
    app.register_blueprint(meetings_bp, url_prefix='/api/meetings')

    # Register error handlers
    register_error_handlers(app)

    return app
