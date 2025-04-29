from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

notification_bp = Blueprint('notifications', __name__)

# Route to get notifications for the current user with optional filters
@notification_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user = get_jwt_identity()
    
    try:
        # Get query parameters for filtering and pagination
        is_read = request.args.get('is_read')
        limit = request.args.get('limit', default=20, type=int)
        
        # Base query for notifications of the current user
        query = Notification.query.filter_by(user_id=current_user['id'])
        
        # Filter by read/unread status if provided
        if is_read is not None:
            query = query.filter_by(is_read=is_read.lower() == 'true')
        
        query = query.order_by(Notification.created_at.desc())
        
        # Apply limit to the query
        notifications = query.limit(limit).all()
        
        # Return notifications in a serialized format
        return jsonify([{
            'id': notification.id,
            'message': notification.message,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat(),
            'related_entity_type': notification.related_entity_type,
            'related_entity_id': notification.related_entity_id
        } for notification in notifications]), 200

    except SQLAlchemyError as e:
        # Return error message if there was an issue with the database
        return jsonify({'error': f'Database error: {str(e)}'}), 500


# Route to get the unread notification count for the current user
@notification_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    current_user = get_jwt_identity()
    
    try:
        # Count unread notifications for the current user
        unread_count = Notification.query.filter_by(
            user_id=current_user['id'],
            is_read=False
        ).count()
        
        return jsonify({'count': unread_count}), 200

    except SQLAlchemyError as e:
        # Return error message if there was an issue with the database
        return jsonify({'error': f'Database error: {str(e)}'}), 500


# Route to mark a single notification as read
@notification_bp.route('/<int:notification_id>/mark-read', methods=['PATCH'])
@jwt_required()
def mark_notification_read(notification_id):
    current_user = get_jwt_identity()
    
    try:
        # Retrieve the notification by ID and ensure it's for the current user
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=current_user['id']
        ).first_or_404()
        
        # Check if notification is already read
        if notification.is_read:
            return jsonify({'message': 'Notification already marked as read'}), 200
        
        # Mark the notification as read
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'message': 'Notification marked as read',
            'notification': {
                'id': notification.id,
                'is_read': notification.is_read
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


# Route to mark all unread notifications as read
@notification_bp.route('/mark-all-read', methods=['PATCH'])
@jwt_required()
def mark_all_notifications_read():
    current_user = get_jwt_identity()
    
    try:
        # Update all unread notifications to read
        updated_count = Notification.query.filter_by(
            user_id=current_user['id'],
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({
            'message': f'{updated_count} notifications marked as read'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500


# Helper function to create notifications (can be used in other parts of the app)
def create_notification(user_id, message, related_entity_type=None, related_entity_id=None):
    try:
        notification = Notification(
            user_id=user_id,
            message=message,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id
        )
        
        db.session.add(notification)
        db.session.commit()
        
        # You may emit an event here (e.g., WebSocket or SocketIO) for real-time notifications
        return notification

    except SQLAlchemyError as e:
        db.session.rollback()
        return None
