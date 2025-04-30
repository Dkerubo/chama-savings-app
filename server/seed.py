import uuid
import time
from datetime import datetime, timedelta, UTC
from decimal import Decimal
from app.models.user import User
from app.models.group import Group
from app.models.member import Member
from app.models.contribution import Contribution
from app.models.loan import Loan
from app.models.loan_repayment import LoanRepayment
from app.models.memberships import Membership
from app.models.invitations import Invitation
from app.models.action_items import ActionItem
from app.models.message_threads import MessageThread
from app.models.goals import Goal
from app.models.recurrence_rules import RecurrenceRule
from app.extensions import db
from app import create_app

app = create_app()
app.app_context().push()
app.config['DISABLE_SOCKETIO'] = True

def generate_unique_receipt_number():
    return f"RC-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"

def seed_users():
    users = [
        {"username": "superadmin", "email": "superadmin@chama.com", "password": "Admin@1234", "role": "superadmin", "phone_number": "254712345678"},
        {"username": "admin", "email": "admin@chama.com", "password": "Admin@1234", "role": "admin", "phone_number": "254712345679"},
        {"username": "member1", "email": "member1@chama.com", "password": "Member@123", "role": "member", "phone_number": "254712345670"},
        {"username": "member2", "email": "member2@chama.com", "password": "Member@123", "role": "member", "phone_number": "254712345671"},
        {"username": "member3", "email": "member3@chama.com", "password": "Member@123", "role": "member", "phone_number": "254712345672"},
        {"username": "johndoe", "email": "john@example.com", "password": "password", "role": "admin", "phone_number": "254700000001"},
    ]
    for u in users:
        try:
            new_user = User(**u)
            db.session.add(new_user)
            print(f"Created user: {new_user.username}")
        except Exception as e:
            print(f"Error creating user {u['username']}: {str(e)}")
            db.session.rollback()
    db.session.commit()

def seed_groups():
    groups = [
        {"name": "Family Savings", "admin_id": 1, "target_amount": 1000000, "description": "Family savings group"},
        {"name": "Business Partners", "admin_id": 2, "target_amount": 2000000, "description": "Business investment group"},
        {"name": "Development Team", "description": "Handles product development."},
        {"name": "Marketing Team", "description": "Focuses on outreach and promotion."},
    ]
    for g in groups:
        try:
            new_group = Group(**g)
            db.session.add(new_group)
            print(f"Created group: {new_group.name}")
        except Exception as e:
            print(f"Error creating group {g['name']}: {str(e)}")
            db.session.rollback()
    db.session.commit()

def seed_memberships():
    memberships = [
        {"user_id": 1, "group_id": 1, "role": "admin"},
        {"user_id": 2, "group_id": 1, "role": "member"},
        {"user_id": 2, "group_id": 2, "role": "member"},
        {"user_id": 3, "group_id": 2, "role": "admin"},
    ]
    for m in memberships:
        try:
            db.session.add(Membership(**m))
            print(f"Added membership: User {m['user_id']} to Group {m['group_id']}")
        except Exception as e:
            print(f"Error adding membership: {str(e)}")
            db.session.rollback()
    db.session.commit()

def seed_contributions():
    contributions = [
        {"member_id": 3, "group_id": 1, "amount": 10000, "note": "January contribution"},
        {"member_id": 4, "group_id": 1, "amount": 15000, "note": "January contribution"},
        {"member_id": 5, "group_id": 2, "amount": 20000, "note": "January contribution"},
    ]
    for c in contributions:
        try:
            contrib = Contribution(
                member_id=c["member_id"],
                group_id=c["group_id"],
                amount=c["amount"],
                note=c["note"],
                status="confirmed",
                receipt_number=generate_unique_receipt_number()
            )
            db.session.add(contrib)
            print(f"Added contribution: {c['amount']} from Member {c['member_id']}")
        except Exception as e:
            print(f"Error adding contribution: {str(e)}")
            db.session.rollback()
    db.session.commit()

def seed_loans():
    loans = [
        {"member_id": 3, "group_id": 1, "amount": 50000, "term_months": 6, "purpose": "Business expansion"},
        {"member_id": 5, "group_id": 2, "amount": 100000, "term_months": 12, "purpose": "House construction"},
    ]
    for l in loans:
        try:
            loan = Loan(
                member_id=l["member_id"],
                group_id=l["group_id"],
                amount=Decimal(l["amount"]),
                term_months=l["term_months"],
                purpose=l["purpose"],
                status="approved",
                approved_at=datetime.now(UTC),
                approved_by=1,
                issue_date=datetime.now(UTC),
                due_date=datetime.now(UTC) + timedelta(days=30 * l["term_months"])
            )
            db.session.add(loan)
            print(f"Added loan: {l['amount']} for Member {l['member_id']}")
        except Exception as e:
            print(f"Error adding loan: {str(e)}")
            db.session.rollback()
    db.session.commit()

def seed_loan_repayments():
    repayments = [
        {"loan_id": 1, "amount": 10000, "payment_method": "M-Pesa"},
        {"loan_id": 1, "amount": 10000, "payment_method": "M-Pesa"},
        {"loan_id": 2, "amount": 20000, "payment_method": "Bank Transfer"},
    ]
    for r in repayments:
        try:
            repayment = LoanRepayment(
                loan_id=r["loan_id"],
                amount=r["amount"],
                payment_method=r["payment_method"],
                paid_at=datetime.now(UTC)
            )
            db.session.add(repayment)
            print(f"Added repayment: {r['amount']} for Loan {r['loan_id']}")
        except Exception as e:
            print(f"Error adding repayment: {str(e)}")
            db.session.rollback()
    db.session.commit()

def seed_invitations():
    try:
        invitation = Invitation(group_id=1, email="invitee@example.com", status="pending")
        db.session.add(invitation)
        db.session.commit()
        print("Added invitation.")
    except Exception as e:
        print(f"Error adding invitation: {str(e)}")
        db.session.rollback()

def seed_action_items():
    try:
        action = ActionItem(group_id=1, description="Plan end-of-year party", due_date=datetime.now(UTC) + timedelta(days=30))
        db.session.add(action)
        db.session.commit()
        print("Added action item.")
    except Exception as e:
        print(f"Error adding action item: {str(e)}")
        db.session.rollback()

def seed_messages():
    try:
        msg = MessageThread(sender_id=1, group_id=1, content="Welcome to the group!")
        db.session.add(msg)
        db.session.commit()
        print("Added message.")
    except Exception as e:
        print(f"Error adding message: {str(e)}")
        db.session.rollback()

def seed_goals():
    try:
        goal = Goal(group_id=1, title="Save for trip", amount=500000, deadline=datetime.now(UTC) + timedelta(days=90))
        db.session.add(goal)
        db.session.commit()
        print("Added goal.")
    except Exception as e:
        print(f"Error adding goal: {str(e)}")
        db.session.rollback()

def seed_recurrence_rules():
    try:
        rule = RecurrenceRule(group_id=1, frequency="monthly", interval=1)
        db.session.add(rule)
        db.session.commit()
        print("Added recurrence rule.")
    except Exception as e:
        print(f"Error adding recurrence rule: {str(e)}")
        db.session.rollback()

def run_seeds():
    db.drop_all()
    db.create_all()
    seed_users()
    seed_groups()
    seed_memberships()
    seed_contributions()
    seed_loans()
    seed_loan_repayments()
    seed_invitations()
    seed_action_items()
    seed_messages()
    seed_goals()
    seed_recurrence_rules()
    print("✅ Seeding complete.")

if __name__ == '__main__':
    run_seeds()
