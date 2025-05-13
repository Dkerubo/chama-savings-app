# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_socketio import SocketIO
from flask_cors import CORS

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
api = Api()
bcrypt = Bcrypt()
jwt = JWTManager()
ma = Marshmallow()
socketio = SocketIO(cors_allowed_origins="*")