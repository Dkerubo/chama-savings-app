import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from server.extensions import db, migrate, api, jwt
from server.routes.auth import auth_bp
from server.routes.user import user_bp
from server.routes.group import group_bp
from server.routes.member_routes import member_bp
from server.routes.contribution_routes import contribution_bp

# Load environment variables from .env
load_dotenv()

# === Create Flask App Factory ===
def create_app():
    app = Flask(__name__)

    # === Configuration ===
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///chama.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True

    # === CORS Setup ===
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "https://chama-savings-app-1.onrender.com")
    CORS(app, resources={r"/api/*": {"origins": frontend_origin}}, supports_credentials=True)

    # === Init Extensions ===
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    api.init_app(app)

    # === Register Blueprints ===
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(group_bp, url_prefix='/api/groups')
    app.register_blueprint(member_bp, url_prefix='/api/members')
    app.register_blueprint(contribution_bp, url_prefix='/api/contributions')

    # === Root Test Route ===
    @app.route('/')
    def home():
        return jsonify({"message": "✅ Welcome to the Chama API"})

    return app

# === Run the app only in development ===
if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 10000))  # Render uses PORT env variable
    app.run(host='0.0.0.0', port=port, debug=True)

