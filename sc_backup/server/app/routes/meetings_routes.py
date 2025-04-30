from flask import Blueprint, request, jsonify
from app import db
from app.models.meetings import Meeting
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

meetings_bp = Blueprint('meetings', __name__)

@meetings_bp.route('/meetings', methods=['GET'])
def get_meetings():
    meetings = Meeting.query.all()
    return jsonify([{
        'id': m.id,
        'title': m.title,
        'description': m.description,
        'date': m.date.isoformat(),
        'time': m.time.isoformat(),
        'location': m.location,
        'created_at': m.created_at.isoformat()
    } for m in meetings])

@meetings_bp.route('/meetings', methods=['POST'])
def create_meeting():
    data = request.json
    meeting = Meeting(
        title=data['title'],
        description=data.get('description'),
        date=data['date'],
        time=data['time'],
        location=data.get('location')
    )
    db.session.add(meeting)
    db.session.commit()
    return jsonify({'message': 'Meeting created successfully'}), 201
