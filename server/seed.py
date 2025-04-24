from app import create_app, db
from app.models.user import User
from app.models.group import Group
from app.models.member import Member
from app.models.contribution import Contribution
from app.models.loan import Loan
from app.models.loan_repayment import LoanRepayment
from app.models.investment import Investment
from app.models.investment_payment import InvestmentPayment

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Create a group
        group = Group(name="Green Chama")
        db.session.add(group)
        db.session.flush()  # Ensure group.id is available

        # Create an admin user
        admin_user = User(
            username="adminuser",
            email="admin@example.com",
            role="admin",
            group_id=group.id
        )
        admin_user.set_password("admin123")
        db.session.add(admin_user)

        # Assign admin to group
        group.admin_id = admin_user.id

        # Create a member user
        member_user = User(
            username="memberuser",
            email="member@example.com",
            role="member",
            group_id=group.id
        )
        member_user.set_password("member123")
        db.session.add(member_user)
        db.session.flush()  # Ensure member_user.id is available

        # Create a Member profile
        member = Member(
            user_id=member_user.id,
            phone="0712345678",
            address="Nairobi",
            group_id=group.id
        )
        db.session.add(member)
        db.session.flush()

        # Add a contribution
        contribution = Contribution(
            member_id=member.id,
            amount=500.0,
            note="Initial contribution"
        )
        db.session.add(contribution)

        # Add a loan
        loan = Loan(
            member_id=member.id,
            amount=1000.0,
            interest_rate=0.1,
            term_months=6,
            status="approved"
        )
        db.session.add(loan)
        db.session.flush()

        # Add a loan repayment
        repayment = LoanRepayment(
            loan_id=loan.id,
            amount=200.0,
            note="First repayment"
        )
        db.session.add(repayment)

        # Add an investment
        investment = Investment(
            member_id=member.id,
            amount=1500.0,
            project_name="Solar Project",
            returns=300.0,
            status="active"
        )
        db.session.add(investment)
        db.session.flush()

        # Add an investment payment
        payment = InvestmentPayment(
            investment_id=investment.id,
            amount=150.0
        )
        db.session.add(payment)

        db.session.commit()
        print("✅ Seed data inserted successfully.")

if __name__ == "__main__":
    seed()
