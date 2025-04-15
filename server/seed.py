#!/usr/bin/env python3

from server.app import create_app
from server.extensions import db
from server.models import Member, Group, Loan, Contribution, User
from faker import Faker
import random as rc
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

fake = Faker()
app = create_app()

with app.app_context():
    # Clear existing data
    Contribution.query.delete()
    Loan.query.delete()
    Member.query.delete()
    Group.query.delete()
    User.query.delete()

    # Seed Groups
    groups = []
    group_names = ["Umoja Savings", "Harambee Investors", "Twende Pamoja", "Mali Safi", "Faida Group"]
    for name in group_names:
        group = Group(
            name=name,
            created_at=fake.date_time_between(start_date='-1y', end_date='now'),
            monthly_target=rc.randint(5000, 20000)
        )
        groups.append(group)

    db.session.add_all(groups)
    db.session.commit()

    # Seed Members
    members = []
    for i in range(20):
        member = Member(
            name=fake.name(),
            email=fake.unique.email(),
            phone=fake.unique.phone_number(),
            joined_date=fake.date_time_between(start_date='-1y', end_date='now'),
            status=rc.choice(["Active", "Inactive", "Suspended"])
        )
        # Assign members to random groups
        for _ in range(rc.randint(1, 3)):
            member.groups.append(rc.choice(groups))
        members.append(member)

    db.session.add_all(members)
    db.session.commit()

    # Seed Loans
    loans = []
    for i in range(15):
        issue_date = fake.date_time_between(start_date='-11m', end_date='-1m')
        due_date = issue_date + timedelta(days=rc.randint(30, 180))
        status = rc.choice(["Active", "Paid", "Defaulted", "Pending"])
        
        loan = Loan(
            amount=rc.randint(1000, 50000),
            interest_rate=rc.uniform(5.0, 15.0),
            issue_date=issue_date,
            due_date=due_date,
            status=status,
            member_id=rc.choice(members).id,
            group_id=rc.choice(groups).id
        )
        loans.append(loan)

    db.session.add_all(loans)
    db.session.commit()

    # Seed Contributions
    contributions = []
    for i in range(100):
        contribution = Contribution(
            amount=rc.randint(500, 10000),
            date=fake.date_time_between(start_date='-1y', end_date='now'),
            payment_method=rc.choice(["M-Pesa", "Bank Transfer", "Cash"]),
            member_id=rc.choice(members).id,
            group_id=rc.choice(groups).id
        )
        contributions.append(contribution)

    db.session.add_all(contributions)
    db.session.commit()

    # Seed Users (Admin and Regular Users)
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
        *[
            User(
                username=member.email.split('@')[0],
                email=member.email,
                password_hash=generate_password_hash("member123"),
                role="Member",
                member_id=member.id
            )
            for member in members[:5]  # Create user accounts for first 5 members
        ]
    ]

    db.session.add_all(users)
    db.session.commit()

    print("Chama database seeded successfully with:")
    print(f"- {len(groups)} groups")
    print(f"- {len(members)} members")
    print(f"- {len(loans)} loans")
    print(f"- {len(contributions)} contributions")
    print(f"- {len(users)} users")