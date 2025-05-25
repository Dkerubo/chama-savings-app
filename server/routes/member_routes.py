from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.extensions import db
from server.models.member import Member
from server.models.contribution import Contribution
from server.models.loan import Loan
from sqlalchemy import or_

member_bp = Blueprint('member', __name__, url_prefix='/api/member')


# ─────────────────────────────
# GET all members
# ─────────────────────────────
@member_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_members():
    try:
        members = Member.query.all()
        return jsonify([m.serialize() for m in members]), 200
    except Exception as e:
        print("❌ Failed to get members:", e)
        return jsonify({'error': 'Failed to retrieve members'}), 500


# ─────────────────────────────
# GET member by ID
# ─────────────────────────────
@member_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_member(id):
    try:
        member = Member.query.get_or_404(id)
        return jsonify(member.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────
# GET member by user ID
# ─────────────────────────────
@member_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_member_by_user(user_id):
    try:
        member = Member.query.filter_by(user_id=user_id).first()
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        return jsonify({'member_id': member.id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────
# CREATE a new member
# ─────────────────────────────
@member_bp.route('/', methods=['POST'])
@jwt_required()
def create_member():
    data = request.get_json()
    try:
        if not all(k in data for k in ['name', 'email', 'user_id', 'group_id']):
            return jsonify({'error': 'Missing required fields: name, email, user_id, group_id'}), 400

        member = Member(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            address=data.get('address'),
            status=data.get('status', 'pending'),
            user_id=data['user_id'],
            group_id=data['group_id']
        )
        db.session.add(member)
        db.session.commit()
        return jsonify(member.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# ─────────────────────────────
# UPDATE member
# ─────────────────────────────
@member_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_member(id):
    data = request.get_json()
    try:
        member = Member.query.get_or_404(id)
        member.name = data.get('name', member.name)
        member.email = data.get('email', member.email)
        member.phone = data.get('phone', member.phone)
        member.address = data.get('address', member.address)
        member.status = data.get('status', member.status)
        member.group_id = data.get('group_id', member.group_id)
        member.user_id = data.get('user_id', member.user_id)

        db.session.commit()
        return jsonify(member.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# ─────────────────────────────
# DELETE member
# ─────────────────────────────
@member_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_member(id):
    try:
        member = Member.query.get_or_404(id)
        db.session.delete(member)
        db.session.commit()
        return jsonify({'message': 'Member deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────
# GET members by group ID
# ─────────────────────────────
@member_bp.route('/group/<int:group_id>', methods=['GET'])
@jwt_required()
def get_members_by_group(group_id):
    try:
        members = Member.query.filter_by(group_id=group_id).all()
        return jsonify([m.serialize() for m in members]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────
# SEARCH members by name/email
# ─────────────────────────────
@member_bp.route('/search', methods=['GET'])
@jwt_required()
def search_members():
    query = request.args.get('q', '')
    try:
        members = Member.query.filter(
            or_(
                Member.name.ilike(f'%{query}%'),
                Member.email.ilike(f'%{query}%')
            )
        ).all()
        return jsonify([m.serialize() for m in members]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────
# STUB: Invite Member
# ─────────────────────────────
@member_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_member():
    data = request.get_json()
    email = data.get('email')
    group_id = data.get('group_id')

    if not email or not group_id:
        return jsonify({'error': 'Email and group_id are required.'}), 400

    try:
        # In production: send an email or create a user entry
        return jsonify({
            'message': f'Invite sent to {email} for group ID {group_id} (stubbed)'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────
# DASHBOARD STATS for current member
# ─────────────────────────────
@member_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_member_summary():
    try:
        current_user = get_jwt_identity()
        member = Member.query.filter_by(user_id=current_user['id']).first()

        if not member:
            return jsonify({'error': 'Member not found'}), 404

        contributions = sum([float(c.amount or 0) for c in member.contributions or [] if c.status == 'confirmed'])
        loans = sum([float(l.amount or 0) for l in member.loans or [] if l.status in ['approved', 'active']])
        payments = sum([float(p.amount or 0) for l in member.loans or [] for p in l.payments or [] if p.status == 'completed'])
        balance = contributions - payments

        return jsonify({
            'contributions': round(contributions, 2),
            'loans': round(loans, 2),
            'payments': round(payments, 2),
            'balance': round(balance, 2)
        }), 200

    except Exception as e:
        print("❌ Error in get_member_summary:", e)
        return jsonify({'error': 'Failed to load member stats'}), 500
