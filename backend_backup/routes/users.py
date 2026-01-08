from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import User, Organization

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """get current user's profile"""
    user_data = {
        'id': current_user.id,
        'email': current_user.email,
        'full_name': current_user.full_name,
        'phone': current_user.phone,
        'role': current_user.role,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None
    }
    
    # add organization details if user is an organization
    if current_user.role == 'organization':
        org = Organization.query.filter_by(user_id=current_user.id).first()
        if org:
            user_data['organization'] = {
                'id': org.id,
                'name': org.name,
                'description': org.description,
                'contact_person': org.contact_person,
                'website': org.website
            }
    
    return jsonify(user_data)

@users_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """update user profile information"""
    data = request.json
    
    if not data:
        return jsonify({'error': 'no data provided'}), 400
    
    # update allowed fields
    if 'full_name' in data:
        current_user.full_name = data['full_name']
    
    if 'phone' in data:
        current_user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify({
        'message': 'profile updated successfully',
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'full_name': current_user.full_name,
            'phone': current_user.phone,
            'role': current_user.role
        }
    })

# test route
@users_bp.route('/test')
def test():
    return jsonify({'message': 'users real endpoints active'})
