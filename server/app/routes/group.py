from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from app.models.group import Group
from app.models.member import Member
from app.extensions import db

group_bp = Blueprint("group_bp", __name__, url_prefix="/api/groups")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@group_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_groups():
    current_user = get_jwt_identity()
    if current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    search = request.args.get("search", "")
    status = request.args.get("status")

    query = Group.query
    if search:
        query = query.filter(Group.name.ilike(f"%{search}%"))
    if status:
        query = query.filter_by(status=status)

    groups = query.all()
    return jsonify([g.serialize(include_members=True) for g in groups]), 200

@group_bp.route("/my-groups", methods=["GET"])
@jwt_required()
def get_my_groups():
    current_user = get_jwt_identity()
    memberships = Member.query.filter_by(user_id=current_user["id"]).all()
    groups = [m.group.serialize(include_members=False) for m in memberships if m.group]
    return jsonify(groups), 200

@group_bp.route("/", methods=["POST"])
@jwt_required()
def create_group():
    current_user = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ["name", "description", "target_amount"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field.replace('_', ' ').title()} is required"}), 400

    try:
        group = Group(
            name=data["name"],
            description=data["description"],
            target_amount=data["target_amount"],
            admin_id=current_user["id"],
            is_public=data.get("is_public", True),
            meeting_schedule=data.get("meeting_schedule"),
            location=data.get("location"),
            logo_url=data.get("logo_url"),
            status=data.get("status", "active")
        )
        db.session.add(group)
        db.session.commit()

        # Add creator as member
        member = Member(
            user_id=current_user["id"],
            group_id=group.id,
            is_admin=True,
            status="active"
        )
        db.session.add(member)
        db.session.commit()

        return jsonify(group.serialize(include_members=True)), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating group: {str(e)}")
        return jsonify({"error": "Failed to create group"}), 500

@group_bp.route("/<int:group_id>", methods=["GET"])
@jwt_required()
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify(group.serialize(include_members=True)), 200

@group_bp.route("/<int:group_id>", methods=["PUT"])
@jwt_required()
def update_group(group_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)
    
    if group.admin_id != current_user["id"] and current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        if "name" in data:
            group.name = data["name"]
        if "description" in data:
            group.description = data["description"]
        if "target_amount" in data:
            group.target_amount = data["target_amount"]
        if "is_public" in data:
            group.is_public = data["is_public"]
        if "meeting_schedule" in data:
            group.meeting_schedule = data["meeting_schedule"]
        if "location" in data:
            group.location = data["location"]
        if "status" in data:
            group.status = data["status"]
        if "logo_url" in data:
            group.logo_url = data["logo_url"]

        db.session.commit()
        return jsonify(group.serialize(include_members=True)), 200
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating group: {str(e)}")
        return jsonify({"error": "Failed to update group"}), 500

@group_bp.route("/<int:group_id>", methods=["DELETE"])
@jwt_required()
def delete_group(group_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if group.admin_id != current_user["id"] and current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    try:
        db.session.delete(group)
        db.session.commit()
        return jsonify({"message": "Group deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting group: {str(e)}")
        return jsonify({"error": "Failed to delete group"}), 500

@group_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        file_url = url_for('static', filename=f'uploads/{filename}', _external=True)
        return jsonify({"url": file_url}), 200
    
    return jsonify({"error": "Invalid file type"}), 400

@group_bp.route("/<int:group_id>/remove-member/<int:user_id>", methods=["DELETE"])
@jwt_required()
def remove_member(group_id, user_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    is_group_admin = group.admin_id == current_user["id"]
    is_platform_admin = current_user["role"] == "admin"

    if not (is_group_admin or is_platform_admin):
        return jsonify({"error": "Unauthorized"}), 403

    member = Member.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({"error": "Member not found in group"}), 404

    try:
        db.session.delete(member)
        db.session.commit()
        return jsonify({"message": "Member removed"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error removing member: {str(e)}")
        return jsonify({"error": "Failed to remove member"}), 500