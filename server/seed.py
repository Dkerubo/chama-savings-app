# seed.py

import uuid
import time
from app.models.user import User
from app import create_app
from app.extensions import db

# Initialize Flask app
app = create_app()
app.config['DISABLE_SOCKETIO'] = True  # Optional if using Flask-SocketIO
app.app_context().push()

def generate_unique_receipt_number():
    """Generate a unique receipt number based on timestamp and UUID."""
    return f"RC-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"

def seed_super_admin():
    """Seed a default super admin user if not already present."""
    super_admin_data = {
        "username": "superadmin",
        "email": "superadmin@chama.com",
        "password": "Admin@1234",  # Pass plain password to trigger hashing
        "role": "superadmin"
    }

    try:
        existing = User.query.filter_by(email=super_admin_data["email"]).first()
        if not existing:
            super_admin = User(**super_admin_data)
            db.session.add(super_admin)
            db.session.commit()
            print(f"✅ Super admin created: {super_admin.username}")
        else:
            print("ℹ️ Super admin already exists.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating super admin: {str(e)}")

def run_seeds():
    """Reset and seed the database."""
    print("🛠️ Initializing database...")
    db.drop_all()
    db.create_all()
    print("🚀 Seeding data...")
    seed_super_admin()
    print("✅ Seeding complete (only Super Admin created).")

if __name__ == '__main__':
    run_seeds()
