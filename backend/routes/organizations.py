"""
Organizations routes for VolaPlace.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Organization, Project, User
from app.config import db

bp = Blueprint('organizations', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_organizations():
    """Get all organizations or user's organization"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role == 'admin':
            # Admin can see all organizations
            orgs = Organization.query.all()
        else:
            # Org admin sees only their organization
            orgs = Organization.query.filter_by(user_id=user_id).all()
        
        return jsonify([{
            'id': org.id,
            'name': org.name,
            'user_id': org.user_id
        } for org in orgs]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
@jwt_required()
def create_organization():
    """Create a new organization"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role not in ['org_admin', 'admin']:
            return jsonify({'error': 'Only org admins can create organizations'}), 403
        
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Organization name is required'}), 400
        
        # Check if user already has an organization
        existing = Organization.query.filter_by(user_id=user_id).first()
        if existing and user.role != 'admin':
            return jsonify({'error': 'You already have an organization'}), 400
        
        org = Organization(
            name=data['name'],
            user_id=user_id
        )
        
        db.session.add(org)
        db.session.commit()
        
        return jsonify({
            'id': org.id,
            'name': org.name,
            'user_id': org.user_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "organizations routes are working!"}), 200
