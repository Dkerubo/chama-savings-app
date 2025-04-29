from models.goals import Goal
from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/goals', methods=['POST'])
def create_goal():
    data = request.json
    goal = Goal(
        group_id=data['group_id'],
        name=data['name'],
        description=data.get('description'),
        target_amount=data['target_amount'],
        deadline=data.get('deadline')
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({"message": "Goal created"})
