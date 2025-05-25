# seed.py
from server.app import create_app
from server.extensions import db
from server.models.user import User
from server.models.group import Group
from server.models.member import Member
from server.models.contribution import Contribution
from faker import Faker
import random as rc

fake = Faker()
app = create_app()

with app.app_context():
    try:
        # Clear existing data (in reverse order to avoid foreign key conflicts)
        Contribution.query.delete()
        Member.query.delete()
        Group.query.delete()
        User.query.delete()
        db.session.commit()
        print("🔄 Old data cleared.")

        # Create superadmin, admin, and treasurer users
        superadmin_user = User(username="superadmin", email="superadmin@chama.com", password="admin123", role="superadmin")
        admin_user = User(username="admin", email="admin@chama.com", password="admin123", role="admin")
        treasurer_user = User(username="treasurer", email="treasurer@chama.com", password="treasurer123", role="treasurer")
        db.session.add_all([superadmin_user, admin_user, treasurer_user])
        db.session.commit()
        print("✅ Created users: superadmin, admin, treasurer")

        # Seed groups using admin user
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
            db.session.flush()
            print(f"✅ Group created: {group.name} (ID: {group.id})")
            groups.append(group)
        db.session.commit()

        # Seed members and link them to users and groups
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
                    role="member"
                )
                db.session.add(user)
                db.session.flush()

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
                db.session.flush()

                user.member_id = member.id
                members.append(member)
                member_users.append(user)

                print(f"👤 Member {i+1}/20 created: {member.name} ({member.status}) → {user.username}")

            except Exception as e:
                db.session.rollback()
                print(f"❌ Error creating member {i+1}: {e}")
                continue

        db.session.commit()

        # Seed contributions
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

        print("\n✅ Chama database seeded successfully:")
        print(f"- {len([superadmin_user, admin_user, treasurer_user] + member_users)} users")
        print(f"- {len(groups)} groups")
        print(f"- {len(members)} members")
        print(f"- {len(contributions)} contributions")

    except Exception as e:
        db.session.rollback()
        print(f"\n❌ Seeding failed: {e}")
