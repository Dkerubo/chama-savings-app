from models.invitations import Invitation, JoinRequest
from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group
import uuid

invitations_bp = Blueprint('invitations', __name__)

@invitations_bp.route('/invite', methods=['POST'])
def send_invite():
    data = request.json
    token = str(uuid.uuid4())
    invite = Invitation(group_id=data['group_id'], email=data['email'], token=token)
    db.session.add(invite)
    db.session.commit()
    return jsonify({"token": token, "message": "Invitation sent"})

@invitations_bp.route('/join-request', methods=['POST'])
def request_to_join():
    data = request.json
    join = JoinRequest(user_id=data['user_id'], group_id=data['group_id'], message=data.get('message'))
    db.session.add(join)
    db.session.commit()
    return jsonify({"message": "Join request submitted"})
