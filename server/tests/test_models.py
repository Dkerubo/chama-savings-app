import pytest
from app import create_app
from database import db
from models import Member, Group, Loan, Contribution, User

@pytest.fixture(scope='module')
def test_app():
    app = create_app('testing')  # Make sure your config has a 'testing' env
    with app.app_context():
        yield app

@pytest.fixture(scope='module')
def test_client(test_app):
    return test_app.test_client()

@pytest.fixture(scope='module')
def init_database(test_app):
    db.drop_all()
    db.create_all()

    # Seed basic data for test
    group = Group(name="Test Group", monthly_target=10000)
    member = Member(name="Test Member", email="test@chama.com", phone="0700000000", status="Active", balance=5000.0)
    loan = Loan(amount=10000, interest_rate=10.0, status="Active", member=member, group=group)
    contribution = Contribution(amount=2000, payment_method="M-Pesa", member=member, group=group)
    user = User(username="testuser", email="test@chama.com", password_hash="fakehash", role="Member", member=member)

    db.session.add_all([group, member, loan, contribution, user])
    db.session.commit()

    yield db  # for test access

    db.session.remove()
    db.drop_all()


def test_group_model(init_database):
    group = Group.query.filter_by(name="Test Group").first()
    assert group is not None
    assert group.monthly_target == 10000


def test_member_model(init_database):
    member = Member.query.filter_by(email="test@chama.com").first()
    assert member is not None
    assert member.name == "Test Member"
    assert member.balance == 5000.0


def test_loan_relationship(init_database):
    member = Member.query.filter_by(email="test@chama.com").first()
    assert member.loans
    loan = member.loans[0]
    assert loan.amount == 10000
    assert loan.group.name == "Test Group"


def test_contribution_relationship(init_database):
    member = Member.query.filter_by(email="test@chama.com").first()
    assert member.contributions
    contribution = member.contributions[0]
    assert contribution.amount == 2000
    assert contribution.payment_method == "M-Pesa"


def test_user_relationship(init_database):
    user = User.query.filter_by(username="testuser").first()
    assert user is not None
    assert user.role == "Member"
    assert user.member.email == "test@chama.com"
