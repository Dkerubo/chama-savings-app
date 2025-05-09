import uuid
import time
import random
from datetime import datetime, timedelta, UTC
from decimal import Decimal
from faker import Faker
from app import create_app
from app.models.user import User
from app.extensions import db
from app.models.group import Group
from app.models.member import Member
from app.models.contribution import Contribution
from app.models.loan import Loan
from app.models.loan_repayment import LoanRepayment
from app.models.investment import Investment
from app.models.investment_payment import InvestmentPayment
from app.models.invitations import Invitation

fake = Faker()

def generate_unique_receipt_number():
    """Generate a unique receipt number based on timestamp and UUID."""
    return f"RC-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"

def seed_superadmin():
    """Seed a default superadmin user if not already present."""
    existing = User.query.filter_by(email="superadmin@chama.com").first()
    if not existing:
        superadmin = User(
            username="superadmin",
            email="superadmin@chama.com",
            password="Admin@1234",
            role="superadmin"
        )
        db.session.add(superadmin)
        db.session.commit()
        print("✅ Superadmin created successfully")
    else:
        print("ℹ️ Superadmin already exists")

def create_test_users():
    """Create 20 test users for seeding data"""
    users = []
    for i in range(1, 21):
        user = User(
            username=f"user{i}",
            email=f"user{i}@example.com",
            password=f"Password{i}@",
            role="member"
        )
        users.append(user)
        db.session.add(user)
    db.session.commit()
    return users

def seed_groups(users):
    """Seed 17 groups with random data"""
    groups = []
    for i in range(1, 18):
        group = Group(
            name=fake.company(),
            description=fake.paragraph(),
            target_amount=Decimal(random.randint(10000, 100000)),
            is_public=random.choice([True, False]),
            admin_id=random.choice(users).id,
            meeting_schedule=f"Every {random.choice(['Monday', 'Tuesday', 'Wednesday'])} at {random.randint(1, 12)}pm",
            location=fake.city(),
            status=random.choice(['active', 'active', 'active', 'paused']),
            logo_url=fake.image_url() if random.choice([True, False]) else None
        )
        groups.append(group)
        db.session.add(group)
    db.session.commit()
    return groups

def seed_members(users, groups):
    """Seed members for each group"""
    members = []
    user_ids = [u.id for u in users]  # Get all user IDs first
    
    for group in groups:
        # Add admin as member
        admin_member = Member(
            user_id=group.admin_id,
            group_id=group.id,
            joined_at=datetime.now(UTC),
            status='active',
            role='admin'
        )
        members.append(admin_member)
        db.session.add(admin_member)
        
        # Add 5-10 regular members per group
        num_members = random.randint(5, 10)
        available_user_ids = [uid for uid in user_ids if uid != group.admin_id]
        selected_user_ids = random.sample(available_user_ids, min(num_members, len(available_user_ids)))
        
        for user_id in selected_user_ids:
            member = Member(
                user_id=user_id,
                group_id=group.id,
                joined_at=datetime.now(UTC) - timedelta(days=random.randint(1, 30)),
                status=random.choice(['active', 'active', 'active', 'inactive']),
                role='member'
            )
            members.append(member)
            db.session.add(member)
    
    db.session.commit()
    return members

# ... (keep all previous imports and functions the same until seed_contributions)

def seed_contributions(members, groups):
    """Seed contributions for members"""
    contributions = []
    for group in groups:
        group_members = [m for m in members if m.group_id == group.id]
        for member in group_members:
            for _ in range(random.randint(1, 5)):
                contribution = Contribution(
                    member_id=member.id,
                    group_id=group.id,
                    amount=Decimal(random.randint(500, 5000)),
                    note=fake.sentence(),
                    receipt_number=generate_unique_receipt_number(),
                    status=random.choice(['confirmed', 'confirmed', 'pending'])
                )
                # If your model has created_at, you can set it like this:
                if hasattr(Contribution, 'created_at'):
                    contribution.created_at = datetime.now(UTC) - timedelta(days=random.randint(1, 30))
                contributions.append(contribution)
                db.session.add(contribution)
    db.session.commit()
    return contributions

def seed_loans(members, groups):
    """Seed loans for members"""
    loans = []
    for group in groups:
        group_members = [m for m in members if m.group_id == group.id]
        for member in group_members:
            if random.choice([True, False, False]):  # 1 in 3 chance of getting a loan
                loan = Loan(
                    member_id=member.id,
                    group_id=group.id,
                    amount=Decimal(random.randint(1000, 20000)),
                    purpose=fake.sentence(),
                    term_months=random.choice([3, 6, 12]),
                    interest_rate=Decimal(random.uniform(0.05, 0.15)),  # 5% to 15%
                    status=random.choice(['pending', 'approved', 'rejected', 'paid']),
                    repayment_frequency=random.choice(['monthly', 'weekly']),
                    collateral_description=fake.sentence() if random.choice([True, False]) else None,
                    guarantor_id=random.choice(group_members).id if random.choice([True, False]) else None
                )
                # Set issue_date if status is approved or paid
                if loan.status in ['approved', 'paid']:
                    loan.issue_date = datetime.now(UTC) - timedelta(days=random.randint(1, 90))
                loans.append(loan)
                db.session.add(loan)
    db.session.commit()
    return loans

def seed_loan_repayments(loans):
    """Seed repayments for loans"""
    repayments = []
    for loan in loans:
        if loan.status == 'approved':
            for i in range(random.randint(1, min(5, loan.term_months))):
                repayment = LoanRepayment(
                    loan_id=loan.id,
                    amount=Decimal(loan.monthly_payment()),
                    payment_method=random.choice(['bank', 'mpesa', 'cash']),
                    receipt_number=generate_unique_receipt_number()
                )
                # If your model has created_at or payment_date, set it here:
                if hasattr(LoanRepayment, 'created_at'):
                    repayment.created_at = loan.issue_date + timedelta(days=30*i)
                elif hasattr(LoanRepayment, 'payment_date'):
                    repayment.payment_date = loan.issue_date + timedelta(days=30*i)
                repayments.append(repayment)
                db.session.add(repayment)
    db.session.commit()
    return repayments

# ... (keep the rest of the file the same)

def seed_investments(members, groups):
    """Seed investments for members"""
    investments = []
    for group in groups:
        group_members = [m for m in members if m.group_id == group.id]
        for member in group_members:
            if random.choice([True, False, False]):
                investment = Investment(
                    member_id=member.id,
                    group_id=group.id,
                    project_name=fake.catch_phrase(),
                    amount=Decimal(random.randint(1000, 10000)),
                    expected_return=Decimal(random.uniform(5, 30)),
                    maturity_date=datetime.now(UTC) + timedelta(days=random.randint(90, 365)),
                    status=random.choice(['active', 'active', 'matured', 'withdrawn']),
                    description=fake.paragraph(),
                    risk_level=random.choice(['low', 'medium', 'high'])
                )
                investments.append(investment)
                db.session.add(investment)
    db.session.commit()
    return investments

def seed_investment_payments(investments):
    """Seed payments for investments"""
    payments = []
    for investment in investments:
        # Convert Decimal amount to integer for random range
        investment_amount = int(float(investment.amount))
        for _ in range(random.randint(1, 3)):
            payment = InvestmentPayment(
                investment_id=investment.id,
                amount=Decimal(random.randint(100, investment_amount)),
                payment_method=random.choice(['bank', 'mpesa', 'cash'])
            )
            # If your model has created_at instead of payment_date
            if hasattr(InvestmentPayment, 'created_at'):
                payment.created_at = investment.invested_at + timedelta(days=random.randint(1, 30))
            payments.append(payment)
            db.session.add(payment)
    db.session.commit()
    return payments

def seed_invitations(groups, users):
    """Seed invitations"""
    invitations = []
    for group in groups:
        for _ in range(random.randint(1, 3)):
            invitation = Invitation(
                group_id=group.id,
                email=fake.email(),
                token=uuid.uuid4().hex,
                status=random.choice(['pending', 'accepted', 'declined'])
            )
            invitations.append(invitation)
            db.session.add(invitation)
    db.session.commit()
    return invitations

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
        users = create_test_users()
        groups = seed_groups(users)
        members = seed_members(users, groups)
        contributions = seed_contributions(members, groups)
        loans = seed_loans(members, groups)
        loan_repayments = seed_loan_repayments(loans)
        investments = seed_investments(members, groups)
        investment_payments = seed_investment_payments(investments)
        invitations = seed_invitations(groups, users)
        
        print("✅ Seeding complete. Summary:")
        print(f" - Users: {len(users)}")
        print(f" - Groups: {len(groups)}")
        print(f" - Members: {len(members)}")
        print(f" - Contributions: {len(contributions)}")
        print(f" - Loans: {len(loans)}")
        print(f" - Loan Repayments: {len(loan_repayments)}")
        print(f" - Investments: {len(investments)}")
        print(f" - Investment Payments: {len(investment_payments)}")
        print(f" - Invitations: {len(invitations)}")

if __name__ == '__main__':
    reset_and_seed()