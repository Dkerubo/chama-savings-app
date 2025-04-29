from models.message_threads import MessageThread, Comment
from flask import Blueprint, request, jsonify
from app import db
from app.models.member import Member
from app.models.user import User
from app.models.group import Group

messaging_bp = Blueprint('messaging', __name__)

@messaging_bp.route('/threads', methods=['POST'])
def create_thread():
    data = request.json
    thread = MessageThread(group_id=data['group_id'], subject=data['subject'], created_by=data['created_by'])
    db.session.add(thread)
    db.session.commit()
    return jsonify({"thread_id": thread.id})

@messaging_bp.route('/comments', methods=['POST'])
def post_comment():
    data = request.json
    comment = Comment(thread_id=data['thread_id'], user_id=data['user_id'], content=data['content'])
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "Comment posted"})
