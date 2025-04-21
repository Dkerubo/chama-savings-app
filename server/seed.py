#from app import create_app
from database import db
from models import User, Member, Group, Loan, Contribution, Investment, LoanRepayment
from faker import Faker
import random as rc
from werkzeug.security import generate_password_hash
from datetime import timedelta

fake = Faker()
app = create_app()

with app.app_context():
    # Clear existing data
    print("\n🧹 Clearing existing database records...")
    Contribution.query.delete()
    Loan.query.delete()
    User.query.delete()
    Member.query.delete()
    Group.query.delete()

    # Seed Groups
    print("🌱 Seeding groups...")
    group_names = [
        "Umoja Savings", "Harambee Investors", "Twende Pamoja", 
        "Mali Safi", "Faida Group"
    ]
    groups = [
        Group(
            name=name,
            created_at=fake.date_time_between(start_date='-1y', end_date='now'),
            monthly_target=rc.randint(5000, 20000)
        )
        for name in group_names
    ]
    db.session.add_all(groups)
    db.session.commit()

    # Seed Members
    print("🌱 Seeding members...")
    members = []
    for _ in range(20):
        member = Member(
            name=fake.name(),
            email=fake.unique.email(),
            phone=fake.unique.phone_number(),
            joined_date=fake.date_time_between(start_date='-1y', end_date='now'),
            status=rc.choice(["Active", "Inactive", "Suspended"]),
            balance=round(rc.uniform(0, 50000), 2)
        )
        # Assign member to 1–2 random groups
        for _ in range(rc.randint(1, 2)):
            group = rc.choice(groups)
            if group not in member.groups:
                member.groups.append(group)
        members.append(member)

    db.session.add_all(members)
    db.session.commit()

    # Seed Loans
    print("🌱 Seeding loans...")
    loans = []
    for _ in range(15):
        issue_date = fake.date_time_between(start_date='-11m', end_date='-1m')
        due_date = issue_date + timedelta(days=rc.randint(30, 180))
        loans.append(Loan(
            amount=rc.randint(1000, 50000),
            interest_rate=round(rc.uniform(5.0, 15.0), 2),
            issue_date=issue_date,
            due_date=due_date,
            status=rc.choice(["Active", "Paid", "Defaulted", "Pending"]),
            member_id=rc.choice(members).id,
            group_id=rc.choice(groups).id
        ))

    db.session.add_all(loans)
    db.session.commit()

    # Seed Contributions
    print("🌱 Seeding contributions...")
    contributions = [
        Contribution(
            amount=rc.randint(500, 10000),
            date=fake.date_time_between(start_date='-1y', end_date='now'),
            payment_method=rc.choice(["M-Pesa", "Bank Transfer", "Cash"]),
            member_id=rc.choice(members).id,
            group_id=rc.choice(groups).id
        )
        for _ in range(100)
    ]
    db.session.add_all(contributions)
    db.session.commit()

    # Seed Users
    print("🌱 Seeding users...")
    users = [
        User(
            username="admin",
            email="admin@chama.com",
            password_hash=generate_password_hash("admin123"),
            role="Admin",
            member_id=None
        ),
        User(
            username="treasurer",
            email="treasurer@chama.com",
            password_hash=generate_password_hash("treasurer123"),
            role="Treasurer",
            member_id=None
        ),
    ]

    for member in members:
        users.append(User(
            username=member.email.split('@')[0],
            email=member.email,
            password_hash=generate_password_hash("member123"),
            role="Member",
            member_id=member.id
        ))

    db.session.add_all(users)
    db.session.commit()

    # Final Summary
    print("\n✅ Database seeded successfully!")
    print(f"📊 Groups: {len(groups)}")
    print(f"👥 Members: {len(members)}")
    print(f"💸 Loans: {len(loans)}")
    print(f"💰 Contributions: {len(contributions)}")
    print(f"🔐 Users: {len(users)}\n")
