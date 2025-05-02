from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.group import Group
from app.models.member import Member
from app.extensions import db

group_bp = Blueprint("group_bp", __name__, url_prefix="/api/groups")

# ADMIN: Get all groups with optional filters
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


# MEMBER: Get own groups
@group_bp.route("/my-groups", methods=["GET"])
@jwt_required()
def get_my_groups():
    current_user = get_jwt_identity()
    memberships = Member.query.filter_by(user_id=current_user["id"]).all()
    groups = [m.group.serialize(include_members=False) for m in memberships if m.group]
    return jsonify(groups), 200


# MEMBER: Create a group
@group_bp.route("/", methods=["POST"])
@jwt_required()
def create_group():
    current_user = get_jwt_identity()
    data = request.get_json()

    name = data.get("name")
    description = data.get("description")
    target_amount = data.get("target_amount")

    if not name or not description or target_amount is None:
        return jsonify({"error": "All fields are required."}), 400

    try:
        group = Group(
            name=name,
            description=description,
            target_amount=target_amount,
            admin_id=current_user["id"],
            is_public=data.get("is_public", True),
            meeting_schedule=data.get("meeting_schedule"),
            location=data.get("location"),
            logo_url=data.get("logo_url"),
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

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# MEMBER: Get a specific group
@group_bp.route("/<int:group_id>", methods=["GET"])
@jwt_required()
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify(group.serialize(include_members=True)), 200


# MEMBER: Delete own group (ADMIN can delete any)
@group_bp.route("/<int:group_id>", methods=["DELETE"])
@jwt_required()
def delete_group(group_id):
    current_user = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if group.admin_id != current_user["id"] and current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted"}), 200


# ADMIN or GROUP ADMIN: Remove member from group
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

    db.session.delete(member)
    db.session.commit()
    return jsonify({"message": "Member removed"}), 200
