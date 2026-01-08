from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import Organization, ProjectLocation

org_bp = Blueprint('organizations', __name__)

@org_bp.route('', methods=['POST'])
@login_required
def create_organization():
    """create organization profile (only for organization role users)"""
    if current_user.role != 'organization':
        return jsonify({'error': 'only organization users can create organization profile'}), 403
    
    data = request.json
    
    # check if organization already exists for this user
    existing_org = Organization.query.filter_by(user_id=current_user.id).first()
    if existing_org:
        return jsonify({'error': 'organization profile already exists for this user'}), 400
    
    # validate required fields
    required = ['name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'missing {field}'}), 400
    
    # create organization
    new_org = Organization(
        user_id=current_user.id,
        name=data['name'],
        description=data.get('description', ''),
        contact_person=data.get('contact_person', ''),
        website=data.get('website', '')
    )
    
    db.session.add(new_org)
    db.session.commit()
    
    return jsonify({
        'message': 'organization created successfully',
        'organization': {
            'id': new_org.id,
            'name': new_org.name,
            'description': new_org.description
        }
    }), 201

@org_bp.route('', methods=['GET'])
@login_required
def get_organization():
    """get organization profile"""
    if current_user.role != 'organization':
        return jsonify({'error': 'only organization users can view organization profile'}), 403
    
    org = Organization.query.filter_by(user_id=current_user.id).first()
    if not org:
        return jsonify({'error': 'organization profile not found'}), 404
    
    return jsonify({
        'id': org.id,
        'name': org.name,
        'description': org.description,
        'contact_person': org.contact_person,
        'website': org.website
    })

@org_bp.route('/locations', methods=['POST'])
@login_required
def create_location():
    """create project location for organization"""
    if current_user.role != 'organization':
        return jsonify({'error': 'only organization users can create locations'}), 403
    
    org = Organization.query.filter_by(user_id=current_user.id).first()
    if not org:
        return jsonify({'error': 'organization profile not found'}), 404
    
    data = request.json
    required = ['name', 'latitude', 'longitude']
    for field in required:
        if field not in data:
            return jsonify({'error': f'missing {field}'}), 400
    
    # create location
    location = ProjectLocation(
        organization_id=org.id,
        name=data['name'],
        latitude=data['latitude'],
        longitude=data['longitude'],
        address=data.get('address', ''),
        city=data.get('city', ''),
        geofence_radius=data.get('geofence_radius', 100)
    )
    
    db.session.add(location)
    db.session.commit()
    
    return jsonify({
        'message': 'location created successfully',
        'location': {
            'id': location.id,
            'name': location.name,
            'latitude': location.latitude,
            'longitude': location.longitude
        }
    }), 201

@org_bp.route('/locations', methods=['GET'])
@login_required
def get_locations():
    """get all locations for organization"""
    if current_user.role != 'organization':
        return jsonify({'error': 'only organization users can view locations'}), 403
    
    org = Organization.query.filter_by(user_id=current_user.id).first()
    if not org:
        return jsonify({'error': 'organization profile not found'}), 404
    
    locations = ProjectLocation.query.filter_by(organization_id=org.id).all()
    
    return jsonify({
        'locations': [
            {
                'id': loc.id,
                'name': loc.name,
                'latitude': loc.latitude,
                'longitude': loc.longitude,
                'address': loc.address,
                'city': loc.city
            }
            for loc in locations
        ]
    })

# test route
@org_bp.route('/test')
def test():
    return jsonify({'message': 'organizations real endpoints active'})
