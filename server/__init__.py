from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

# Initialize extensions
db = SQLAlchemy()
mail = Mail()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)

    # Apply configuration
    app_config = config[config_name]
    app.config.from_object(app_config)
    app_config.init_app(app)

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    CORS(app, supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'], origins=app.config['CORS_ORIGINS'])

    # Register blueprints or routes
    from .views import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
