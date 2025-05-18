# seed.py
from app import create_app
from server.extensions import db
from server.models.user import User
from server.models.group import Group
from server.models.member import Member
from server.models.contribution import Contribution
from faker import Faker
import random as rc
from datetime import timedelta

fake = Faker()
app = create_app()

with app.app_context():
    try:
        # Clear existing data
        Contribution.query.delete()
        Member.query.delete()
        Group.query.delete()
        User.query.delete()
        db.session.commit()
        print("🔄 Old data cleared.")

        # Seed admin and treasurer Users
        admin_user = User(username="admin", email="admin@chama.com", password="admin123", role="Admin")
        treasurer_user = User(username="treasurer", email="treasurer@chama.com", password="treasurer123", role="Treasurer")
        db.session.add_all([admin_user, treasurer_user])
        db.session.commit()
        print(f"✅ New users registered: {admin_user.username}, {treasurer_user.username}")

        # Seed Groups using admin ID
        groups = []
        group_names = ["Umoja Savings", "Harambee Investors", "Twende Pamoja", "Mali Safi", "Faida Group"]
        for name in group_names:
            group = Group(
                name=name,
                created_at=fake.date_time_between(start_date='-1y', end_date='now'),
                target_amount=rc.randint(20000, 100000),
                admin_id=admin_user.id
            )
            db.session.add(group)
            db.session.flush()  # Get group.id before commit
            print(f"✅ Group created: {group.name} (ID: {group.id})")
            groups.append(group)
        db.session.commit()

        # Seed Members with linked Users and Groups
        members = []
        member_users = []
        for i in range(20):
            try:
                email = fake.unique.email()
                username = email.split('@')[0]

                user = User(
                    username=username,
                    email=email,
                    password="member123",
                    role="Member"
                )
                db.session.add(user)
                db.session.flush()  # Ensure user.id is available

                member = Member(
                    name=fake.name(),
                    email=email,
                    phone=fake.unique.phone_number(),
                    joined_date=fake.date_time_between(start_date='-1y', end_date='now'),
                    status=rc.choice(["pending", "active", "inactive", "suspended"]),
                    user_id=user.id,
                    group_id=rc.choice(groups).id
                )
                db.session.add(member)
                db.session.flush()  # Ensure member.id is available

                user.member_id = member.id  # Backlink user to member
                members.append(member)
                member_users.append(user)

                print(f"👤 Member {i+1}/20 created: {member.name} ({member.status}) -> user: {user.username}")

            except Exception as e:
                db.session.rollback()
                print(f"❌ Error creating member {i+1}: {e}")
                continue

        db.session.commit()

        # Seed Contributions
        contributions = []
        for i in range(100):
            try:
                contribution = Contribution(
                    amount=rc.randint(500, 10000),
                    created_at=fake.date_time_between(start_date='-1y', end_date='now'),
                    note=fake.sentence(nb_words=6),
                    member_id=rc.choice(members).id,
                    group_id=rc.choice(groups).id,
                    status=rc.choice(["pending", "confirmed", "rejected"]),
                    receipt_number=fake.unique.uuid4()
                )
                db.session.add(contribution)
                contributions.append(contribution)
            except Exception as e:
                db.session.rollback()
                print(f"❌ Error creating contribution {i+1}: {e}")
        db.session.commit()

        # Summary
        total_users = [admin_user, treasurer_user] + member_users
        print("\n✅ Chama database seeded successfully:")
        print(f"- {len(total_users)} users")
        print(f"- {len(groups)} groups")
        print(f"- {len(members)} members")
        print(f"- {len(contributions)} contributions")

    except Exception as e:
        db.session.rollback()
        print(f"\n❌ Seeding failed: {e}")
