from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import blueprints *after* app and extensions are initialized
    from app.routes.auth_routes import auth_bp
    from app.routes.group_routes import group_bp
    from app.routes.member_routes import member_bp
    from app.routes.contribution_routes import contribution_bp
    from app.routes.loan_routes import loan_bp
    from app.routes.investment_routes import investment_bp
    from app.routes.investment_payment_routes import payment_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(group_bp, url_prefix='/api')
    app.register_blueprint(member_bp, url_prefix='/api')
    app.register_blueprint(contribution_bp, url_prefix='/api')
    app.register_blueprint(loan_bp, url_prefix='/api')
    app.register_blueprint(investment_bp, url_prefix='/api')
    app.register_blueprint(payment_bp, url_prefix='/api')

    from app.models import user, member, group, contribution, loan, loan_repayment, investment
    return app
