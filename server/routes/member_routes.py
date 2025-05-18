from flask import Blueprint, request, jsonify
from server.extensions import db
from models.member import Member
from sqlalchemy import or_

member_bp = Blueprint('member', __name__)

@member_bp.route('/', methods=['GET'])
def get_all_members():
    try:
        members = Member.query.all()
        return jsonify([m.serialize() for m in members]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@member_bp.route('/<int:id>', methods=['GET'])
def get_member(id):
    try:
        member = Member.query.get_or_404(id)
        return jsonify(member.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    # Backend Endpoint: add a route to fetch member info for the current user
@member_bp.route('/user/<int:user_id>', methods=['GET'])
def get_member_by_user(user_id):
    member = Member.query.filter_by(user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    return jsonify({'member_id': member.id})

@member_bp.route('/', methods=['POST'])
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

@member_bp.route('/<int:id>', methods=['PUT'])
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

@member_bp.route('/<int:id>', methods=['DELETE'])
def delete_member(id):
    try:
        member = Member.query.get_or_404(id)
        db.session.delete(member)
        db.session.commit()
        return jsonify({'message': 'Member deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ✅ Filter by Group
@member_bp.route('/group/<int:group_id>', methods=['GET'])
def get_members_by_group(group_id):
    try:
        members = Member.query.filter_by(group_id=group_id).all()
        return jsonify([m.serialize() for m in members]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Search by Name or Email
@member_bp.route('/search', methods=['GET'])
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

# ✅ Invite Member (Stub logic)
@member_bp.route('/invite', methods=['POST'])
def invite_member():
    data = request.get_json()
    email = data.get('email')
    group_id = data.get('group_id')

    if not email or not group_id:
        return jsonify({'error': 'Email and group_id are required.'}), 400

    try:
        # In real app: send email invite or create user with pending status
        return jsonify({
            'message': f'Invite sent to {email} for group ID {group_id} (stubbed)'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
