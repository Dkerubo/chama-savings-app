import uuid
import time
from datetime import datetime, timedelta, UTC
from decimal import Decimal
from app.extensions import db
from app.models.user import User
from app.models.group import Group
from app.models.member import Member
from app.models.contribution import Contribution
from app.models.loan import Loan
from app.models.loan_repayment import LoanRepayment
from app.models.notification import Notification, NotificationType
from app import create_app

# Create the Flask application
app = create_app()

# Disable socketio for seeding
app.config['DISABLE_SOCKETIO'] = True

def generate_unique_receipt_number():
    return f"RC-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"

def seed_users():
    print("Seeding users...")
    users = [
        {"username": "superadmin", "email": "superadmin@chama.com", "password": "Admin@1234", "role": "superadmin", "phone_number": "254712345678"},
        {"username": "admin", "email": "admin@chama.com", "password": "Admin@1234", "role": "admin", "phone_number": "254712345679"},
        {"username": "member1", "email": "member1@chama.com", "password": "Member@123", "role": "member", "phone_number": "254712345670"},
        {"username": "member2", "email": "member2@chama.com", "password": "Member@123", "role": "member", "phone_number": "254712345671"},
        {"username": "member3", "email": "member3@chama.com", "password": "Member@123", "role": "member", "phone_number": "254712345672"},
    ]
    
    for user_data in users:
        try:
            new_user = User(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                role=user_data['role'],
                phone_number=user_data['phone_number']
            )
            db.session.add(new_user)
            print(f"Created user: {new_user.username}")
        except Exception as e:
            print(f"Error creating user {user_data['username']}: {str(e)}")
            db.session.rollback()

    db.session.commit()

def seed_groups():
    print("Seeding groups...")
    groups = [
        {"name": "Family Savings", "admin_id": 1, "target_amount": 1000000, "description": "Family savings group"},
        {"name": "Business Partners", "admin_id": 2, "target_amount": 2000000, "description": "Business investment group"}
    ]

    for group_data in groups:
        try:
            new_group = Group(
                name=group_data['name'],
                admin_id=group_data['admin_id'],
                target_amount=Decimal(group_data['target_amount']),
                description=group_data['description']
            )
            db.session.add(new_group)
            print(f"Created group: {new_group.name}")
        except Exception as e:
            print(f"Error creating group {group_data['name']}: {str(e)}")
            db.session.rollback()

    db.session.commit()

def seed_members():
    print("Seeding members...")
    memberships = [
        (1, 1, True),
        (2, 2, True),
        (3, 1, False),
        (4, 1, False),
        (5, 2, False),
    ]

    for user_id, group_id, is_admin in memberships:
        try:
            new_member = Member(
                user_id=user_id,
                group_id=group_id,
                is_admin=is_admin,
                status='active'
            )
            db.session.add(new_member)
            print(f"Added member: User {user_id} to Group {group_id}")
        except Exception as e:
            print(f"Error adding member: {str(e)}")
            db.session.rollback()

    db.session.commit()

def seed_contributions():
    print("Seeding contributions...")
    contributions = [
        {"member_id": 3, "group_id": 1, "amount": 10000, "note": "January contribution"},
        {"member_id": 4, "group_id": 1, "amount": 15000, "note": "January contribution"},
        {"member_id": 5, "group_id": 2, "amount": 20000, "note": "January contribution"},
    ]

    for contrib_data in contributions:
        try:
            new_contrib = Contribution(
                member_id=contrib_data['member_id'],
                group_id=contrib_data['group_id'],
                amount=contrib_data['amount'],
                note=contrib_data['note'],
                status='confirmed',
                receipt_number=generate_unique_receipt_number()
            )
            db.session.add(new_contrib)
            print(f"Added contribution: {contrib_data['amount']} from Member {contrib_data['member_id']}")
        except Exception as e:
            print(f"Error adding contribution: {str(e)}")
            db.session.rollback()

    db.session.commit()

def seed_loans():
    print("Seeding loans...")
    loans = [
        {"member_id": 3, "group_id": 1, "amount": 50000, "term_months": 6, "purpose": "Business expansion"},
        {"member_id": 5, "group_id": 2, "amount": 100000, "term_months": 12, "purpose": "House construction"},
    ]

    for loan_data in loans:
        try:
            new_loan = Loan(
                member_id=loan_data['member_id'],
                group_id=loan_data['group_id'],
                amount=Decimal(loan_data['amount']),
                term_months=loan_data['term_months'],
                purpose=loan_data['purpose'],
                status='approved',
                approved_at=datetime.now(UTC),
                approved_by=1,
                issue_date=datetime.now(UTC),
                due_date=datetime.now(UTC) + timedelta(days=30*loan_data['term_months'])
            )
            db.session.add(new_loan)
            print(f"Added loan: {loan_data['amount']} for Member {loan_data['member_id']}")
        except Exception as e:
            print(f"Error adding loan: {str(e)}")
            db.session.rollback()

    db.session.commit()

def seed_loan_repayments():
    print("Seeding loan repayments...")
    repayments = [
        {"loan_id": 1, "amount": 10000, "payment_method": "M-Pesa"},
        {"loan_id": 1, "amount": 10000, "payment_method": "M-Pesa"},
        {"loan_id": 2, "amount": 20000, "payment_method": "Bank Transfer"},
    ]

    for repayment_data in repayments:
        try:
            new_repayment = LoanRepayment(
                loan_id=repayment_data['loan_id'],
                amount=repayment_data['amount'],
                payment_method=repayment_data['payment_method'],
                receipt_number=generate_unique_receipt_number()
            )
            db.session.add(new_repayment)
            print(f"Added repayment: {repayment_data['amount']} for Loan {repayment_data['loan_id']}")
        except Exception as e:
            print(f"Error adding repayment: {str(e)}")
            db.session.rollback()

    db.session.commit()

def seed_notifications():
    print("Seeding notifications...")
    notifications = [
        {"user_id": 1, "title": "Welcome", "message": "Welcome to the system", "notification_type": NotificationType.SYSTEM},
        {"user_id": 3, "title": "Contribution", "message": "Your contribution was received", "notification_type": NotificationType.CONTRIBUTION},
    ]

    for notif_data in notifications:
        try:
            new_notif = Notification(
                user_id=notif_data['user_id'],
                title=notif_data['title'],
                message=notif_data['message'],
                notification_type=notif_data['notification_type'].value
            )
            db.session.add(new_notif)
            print(f"Added notification for User {notif_data['user_id']}")
        except Exception as e:
            print(f"Error adding notification: {str(e)}")
            db.session.rollback()

    db.session.commit()

def clear_data():
    print("Clearing existing data...")
    tables = [
        LoanRepayment, Loan, 
        Contribution, Member, 
        Notification, Group, User
    ]
    
    for table in tables:
        try:
            db.session.query(table).delete()
            print(f"Cleared {table.__tablename__}")
        except Exception as e:
            print(f"Error clearing {table.__tablename__}: {str(e)}")
            db.session.rollback()
    
    db.session.commit()

def seed_all():
    with app.app_context():
        clear_data()
        seed_users()
        seed_groups()
        seed_members()
        seed_contributions()
        seed_loans()
        seed_loan_repayments()
        seed_notifications()
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_all()