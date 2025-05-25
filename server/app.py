import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from server.extensions import db, migrate, api, jwt
from server.routes.auth import auth_bp
from server.routes.user import user_bp
from server.routes.group import group_bp
from server.routes.member_routes import member_bp
from server.routes.contribution_routes import contribution_bp

# Load environment variables from .env
load_dotenv()

def create_app():
    app = Flask(__name__)

    # === Configuration ===
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///chama.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24))
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True

    # === CORS Setup ===
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "https://chama-savings-app-1.onrender.com")
    CORS(app, resources={r"/api/*": {"origins": frontend_origin}}, supports_credentials=True)

    # === Initialize Extensions ===
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

    # === Root Route (Health Check) ===
    @app.route('/')
    def home():
        return jsonify({"message": "✅ Welcome to the Chama API"})

    return app


# === For Local Development ===
if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
