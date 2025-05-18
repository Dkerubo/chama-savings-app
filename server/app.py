import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from server.extensions import db, migrate, api, jwt
from routes.auth import auth_bp
from routes.user import user_bp
from routes.group import group_bp
from routes.member_routes import member_bp
from routes.contribution_routes import contribution_bp

# Load environment variables
load_dotenv()

# Initialize extensions
jwt = JWTManager()  # ✅ Make sure this is initialized globally
# db and migrate are already initialized in extensions.py

def create_app():
    app = Flask(__name__)

    # === Configuration ===
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///chama.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']  # Or ['headers', 'cookies'] if you're using cookies
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True

    # === Init extensions ===
    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173")}}, supports_credentials=True)
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
    
    # === Root route ===
    @app.route('/')
    def home():
        return jsonify({"message": "✅ Welcome to the Chama API"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
