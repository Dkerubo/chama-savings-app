import random
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import (
    User, Group, Member, Contribution, 
    Loan, LoanRepayment, Investment, 
    Notification, NotificationType
)

app = create_app()

def seed_users():
    print("Seeding users...")
    users = [
        User(
            username="admin",
            email="admin@chama.com",
            password="AdminPass123",
            role="admin",
            phone_number="+254700000000"
        ),
        User(
            username="treasurer",
            email="treasurer@chama.com",
            password="TreasurerPass123",
            role="admin",
            phone_number="+254711111111"
        ),
        User(
            username="member1",
            email="member1@chama.com",
            password="MemberPass123",
            phone_number="+254722222222"
        ),
        User(
            username="member2",
            email="member2@chama.com",
            password="MemberPass123",
            phone_number="+254733333333"
        ),
        User(
            username="member3",
            email="member3@chama.com",
            password="MemberPass123",
            phone_number="+254744444444"
        )
    ]
    db.session.add_all(users)
    db.session.commit()
    return users

def seed_groups(users):
    print("Seeding groups...")
    groups = [
        Group(
            name="Family Savings",
            admin_id=users[0].id,
            target_amount=500000,
            description="Family investment pool",
            is_public=True,
            meeting_schedule="Every Sunday at 2 PM",
            location="Family Home"
        ),
        Group(
            name="Business Partners",
            admin_id=users[1].id,
            target_amount=1000000,
            description="Business investment group",
            is_public=False,
            meeting_schedule="1st Monday of the month",
            location="Office Boardroom"
        )
    ]
    db.session.add_all(groups)
    db.session.commit()
    return groups

def seed_members(users, groups):
    print("Seeding members...")
    members = []
    
    # Admin is member of all groups
    for group in groups:
        members.append(Member(
            user_id=users[0].id,
            group_id=group.id,
            is_admin=True,
            status='active'
        ))
    
    # Other members
    members.extend([
        Member(
            user_id=users[2].id,
            group_id=groups[0].id,
            status='active'
        ),
        Member(
            user_id=users[3].id,
            group_id=groups[0].id,
            status='active'
        ),
        Member(
            user_id=users[4].id,
            group_id=groups[1].id,
            status='pending'
        )
    ])
    
    db.session.add_all(members)
    db.session.commit()
    return members

def seed_contributions(members, groups):
    print("Seeding contributions...")
    contributions = []
    statuses = ['confirmed', 'pending', 'rejected']
    
    for i, member in enumerate(members):
        for _ in range(random.randint(1, 4)):  # 1-4 contributions per member
            contributions.append(Contribution(
                member_id=member.id,
                group_id=member.group_id,
                amount=random.randint(1000, 20000),
                status=statuses[i % len(statuses)],
                receipt_number=f"RC-{member.id}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                note=f"Monthly contribution {_+1}"
            ))
    
    db.session.add_all(contributions)
    db.session.commit()
    return contributions

def seed_loans(members, groups):
    print("Seeding loans...")
    loans = []
    
    for i, member in enumerate(members[:3]):  # First 3 members get loans
        loan = Loan(
            member_id=member.id,
            group_id=member.group_id,
            amount=random.randint(10000, 50000),
            term_months=random.randint(3, 12),
            purpose=f"Loan for {'business' if i % 2 else 'personal'} use",
            interest_rate=0.1 + (i * 0.02),  # 10%-14% interest
            status='approved' if i < 2 else 'pending'
        )
        loan.set_dates()
        if loan.status == 'approved':
            loan.approved_at = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            loan.approved_by = 1  # Approved by admin
        
        loans.append(loan)
    
    db.session.add_all(loans)
    db.session.commit()
    return loans

def seed_loan_repayments(loans):
    print("Seeding loan repayments...")
    repayments = []
    
    for loan in loans:
        if loan.status == 'approved':
            for i in range(random.randint(1, 3)):  # 1-3 repayments per loan
                repayments.append(LoanRepayment(
                    loan_id=loan.id,
                    amount=loan.amount / loan.term_months * (i+1),
                    payment_method=random.choice(['M-Pesa', 'Bank Transfer', 'Cash']),
                    status='full' if i == loan.term_months - 1 else 'partial',
                    receipt_number=f"RP-{loan.id}-{i+1}"
                ))
    
    db.session.add_all(repayments)
    db.session.commit()
    return repayments

def seed_investments(members, groups):
    print("Seeding investments...")
    investments = []
    
    for i, member in enumerate(members[:3]):  # First 3 members make investments
        investments.append(Investment(
            member_id=member.id,
            group_id=member.group_id,
            amount=random.randint(5000, 50000),
            project_name=f"Project {'A' if i % 2 else 'B'}",
            expected_return=random.uniform(0.1, 0.25),  # 10%-25% expected return
            maturity_date=datetime.utcnow() + timedelta(days=random.randint(90, 365)),
            description=f"Investment in {'real estate' if i % 2 else 'agriculture'}",
            status='active'
        ))
    
    db.session.add_all(investments)
    db.session.commit()
    return investments

def seed_notifications(users):
    print("Seeding notifications...")
    notifications = []
    messages = [
        "Your contribution has been received",
        "Loan payment due in 3 days",
        "New group announcement",
        "Investment matured",
        "Meeting reminder"
    ]
    
    for user in users:
        for i in range(random.randint(2, 5)):  # 2-5 notifications per user
            notifications.append(Notification(
                user_id=user.id,
                title=f"Notification {i+1}",
                message=random.choice(messages),
                notification_type=random.choice(list(NotificationType)).value,
                is_read=random.choice([True, False]),
                priority=random.randint(1, 3)
            ))
    
    db.session.add_all(notifications)
    db.session.commit()
    return notifications

def main():
    with app.app_context():
        print("Starting database seeding...")
        
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Seed data
        users = seed_users()
        groups = seed_groups(users)
        members = seed_members(users, groups)
        contributions = seed_contributions(members, groups)
        loans = seed_loans(members, groups)
        repayments = seed_loan_repayments(loans)
        investments = seed_investments(members, groups)
        notifications = seed_notifications(users)
        
        print("Database seeding completed successfully!")
        print(f"Created: {len(users)} users, {len(groups)} groups, {len(members)} members")
        print(f"         {len(contributions)} contributions, {len(loans)} loans")
        print(f"         {len(repayments)} repayments, {len(investments)} investments")
        print(f"         {len(notifications)} notifications")

if __name__ == "__main__":
    main()