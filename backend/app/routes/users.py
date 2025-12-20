from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import User

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/', methods=['GET'])
def get_users():
    """Get all users (admin only)"""
    users = User.query.all()
    return jsonify({
        'users': [{
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'phone': user.phone,
            'created_at': user.created_at.isoformat() if user.created_at else None
        } for user in users]
    }), 200

@bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Get current user's profile"""
    return jsonify({
        'message': 'Profile retrieved successfully',
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'name': current_user.name,
            'role': current_user.role,
            'phone': current_user.phone,
            'created_at': current_user.created_at.isoformat() if current_user.created_at else None
        }
    })

@bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile"""
    data = request.get_json()
    
    if 'name' in data:
        current_user.name = data['name']
    if 'phone' in data:
        current_user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'name': current_user.name,
            'role': current_user.role,
            'phone': current_user.phone
        }
    })

@bp.route('/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Get user by ID (admin or self only)"""
    if current_user.id != user_id and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'phone': user.phone,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
    })
