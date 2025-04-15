from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager
from flask_bcrypt import Bcrypt

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
login_manager = LoginManager()
bcrypt = Bcrypt()

# Configure login manager
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    from models.user import User
    return User.query.get(int(user_id))

def init_extensions(app):
    """Initialize all extensions with the Flask app"""
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "https://your-production-domain.com"],
            "supports_credentials": True
        }
    })
    login_manager.init_app(app)
    bcrypt.init_app(app)
    
    # Import models to ensure they are registered with SQLAlchemy
    with app.app_context():
        from models.member import Member, member_group
        from models.group import Group
        from models.loan import Loan, LoanRepayment
        from models.contribution import Contribution
        from models.user import User
        from models.investment import Investment, InvestmentReturn, InvestmentDocument
        
        # Create database tables (only needed for initial setup)
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {str(e)}")