from models.action_items import ActionItem
from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

action_bp = Blueprint('action_items', __name__)

@action_bp.route('/action-items', methods=['POST'])
def create_action_item():
    data = request.json
    action = ActionItem(
        meeting_id=data['meeting_id'],
        description=data['description'],
        assigned_to_id=data.get('assigned_to_id'),
        due_date=data.get('due_date')
    )
    db.session.add(action)
    db.session.commit()
    return jsonify({"message": "Action item created"})
