from flask import Blueprint, request, jsonify, session
from app import db
from app.models import Organization, User

bp = Blueprint('organizations', __name__, url_prefix='/api/organizations')

@bp.route('/', methods=['GET'])
def get_organizations():
    organizations = Organization.query.all()
    return jsonify({
        'organizations': [org.to_dict() for org in organizations]
    }), 200

@bp.route('/', methods=['POST'])
def create_organization():
    # Check if user is logged in and is an organization
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if user.role != 'organization':
        return jsonify({'error': 'Only organization users can create organization profiles'}), 403
    
    # Check if organization already exists
    existing_org = Organization.query.filter_by(user_id=user_id).first()
    if existing_org:
        return jsonify({'error': 'Organization profile already exists'}), 400
    
    data = request.get_json()
    
    organization = Organization(
        user_id=user_id,
        description=data.get('description', ''),
        address=data.get('address', ''),
        website=data.get('website', '')
    )
    
    db.session.add(organization)
    db.session.commit()
    
    return jsonify({
        'message': 'Organization profile created successfully',
        'organization': organization.to_dict()
    }), 201

@bp.route('/<int:org_id>', methods=['GET'])
def get_organization(org_id):
    organization = Organization.query.get_or_404(org_id)
    return jsonify({
        'organization': organization.to_dict()
    }), 200