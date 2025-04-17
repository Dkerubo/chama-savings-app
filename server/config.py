import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Helper function for casting strings to boolean
def str_to_bool(value):
    return str(value).lower() in ['1', 'true', 'yes']

# Get project base directory
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Base configuration class."""

    # General Config
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-123!@#')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = str_to_bool(os.getenv('FLASK_DEBUG', '1'))

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "chama.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = str_to_bool(os.getenv('SQLALCHEMY_ECHO', '0'))

    # Security
    CSRF_ENABLED = True
    CSRF_SECRET_KEY = os.getenv('CSRF_SECRET_KEY', 'csrf-secret-key-456$%^')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-789&*(')

    # Session
    SESSION_COOKIE_SECURE = str_to_bool(os.getenv('SESSION_COOKIE_SECURE', '0'))
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # CORS
    CORS_SUPPORTS_CREDENTIALS = True
    cors_origins = os.getenv('CORS_ORIGINS')
    if cors_origins:
        CORS_ORIGINS = [origin.strip() for origin in cors_origins.split(',')]
    else:
        CORS_ORIGINS = ['*']

    # File Uploads
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(basedir, 'uploads'))
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

    # Email
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = str_to_bool(os.getenv('MAIL_USE_TLS', '1'))
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'no-reply@chamaapp.com')

    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100

    @classmethod
    def init_app(cls, app):
        # Ensure upload folder exists
        if not os.path.exists(cls.UPLOAD_FOLDER):
            os.makedirs(cls.UPLOAD_FOLDER)

        # Validate required env vars in production
        if cls.FLASK_ENV == 'production':
            required_vars = ['MAIL_USERNAME', 'MAIL_PASSWORD']
            for var in required_vars:
                if not os.getenv(var):
                    raise RuntimeError(f"Missing required environment variable: {var}")


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    FLASK_ENV = 'production'
    FLASK_DEBUG = False
    SESSION_COOKIE_SECURE = True
    SQLALCHEMY_ECHO = False


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
