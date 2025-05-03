import uuid
import time
from app import create_app
from app.models.user import User
from app.extensions import db
from app.models.user import User
from app.models.group import Group
from app.models.member import Member
from app.models.contribution import Contribution
from app.models.loan import Loan
from app.models.loan_repayment import LoanRepayment
from app.models.investment import Investment

def generate_unique_receipt_number():
    """Generate a unique receipt number based on timestamp and UUID."""
    return f"RC-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"

def seed_superadmin():
    """Seed a default superadmin user if not already present."""
    app = create_app()
    app.config['DISABLE_SOCKETIO'] = True  # Optional if using Flask-SocketIO

    with app.app_context():
        existing = User.query.filter_by(email="superadmin@chama.com").first()
        if not existing:
            superadmin = User(
                username="superadmin",
                email="superadmin@chama.com",
                password="Admin@1234",  # Plain text to trigger hashing
                role="superadmin"
            )
            db.session.add(superadmin)
            db.session.commit()
            print("✅ Superadmin created successfully")
        else:
            print("ℹ️ Superadmin already exists")

def reset_and_seed():
    """Reset and seed the database."""
    app = create_app()
    app.config['DISABLE_SOCKETIO'] = True

    with app.app_context():
        print("🧹 Dropping and recreating database...")
        db.drop_all()
        db.create_all()
        print("🌱 Seeding data...")
        seed_superadmin()
        print("✅ Seeding complete.")

if __name__ == '__main__':
    reset_and_seed()
