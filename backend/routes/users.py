"""
Users routes for VolaPlace.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
from app.config import db
import re
from utils.conflict_validation import validate_phone_unique

bp = Blueprint('users', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "users routes are working!"}), 200

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'mpesa_phone': user.mpesa_phone,
            'role': user.role,
            'profile_completed': user.profile_completed
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile (phone number)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate phone number format (Kenyan format: 254XXXXXXXXX)
        if 'phone' in data:
            phone = data['phone'].strip()
            
            # Basic validation for Kenyan phone numbers
            if not re.match(r'^254\d{9}$', phone):
                return jsonify({'error': 'Invalid phone format. Use 254XXXXXXXXX'}), 400
            
            # Check if phone is already taken by another user using validation utility
            is_valid, error_msg = validate_phone_unique(phone, exclude_user_id=user_id)
            if not is_valid:
                return jsonify({'error': error_msg}), 400
            
            user.phone = phone
        
        # Update M-Pesa phone if provided
        if 'mpesa_phone' in data:
            mpesa_phone = data['mpesa_phone'].strip()
            
            if mpesa_phone and not re.match(r'^254\d{9}$', mpesa_phone):
                return jsonify({'error': 'Invalid M-Pesa phone format. Use 254XXXXXXXXX'}), 400
            
            user.mpesa_phone = mpesa_phone
        
        # Update name if provided
        if 'name' in data:
            user.name = data['name'].strip()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'mpesa_phone': user.mpesa_phone,
            'role': user.role
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

