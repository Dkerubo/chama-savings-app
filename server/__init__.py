from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

db = SQLAlchemy()
mail = Mail()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    CORS(
        app,
        supports_credentials=app.config.get('CORS_SUPPORTS_CREDENTIALS', True),
        origins=app.config.get('CORS_ORIGINS', '*')
    )

    # Register blueprints
    from .views import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
