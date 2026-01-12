"""
Projects routes for VolaPlace.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Project, Organization, User
from app.config import db

bp = Blueprint('projects', __name__)

@bp.route('', methods=['GET'])
def get_projects():
    """Get all projects"""
    try:
        projects = Project.query.all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'lat': p.lat,
            'lon': p.lon,
            'address': p.address,
            'geofence_radius': p.geofence_radius,
            'org_id': p.org_id
        } for p in projects]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role not in ['org_admin', 'admin']:
            return jsonify({'error': 'Only org admins can create projects'}), 403
        
        data = request.get_json()
        
        # Validation
        required_fields = ['name', 'lat', 'lon']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get or create organization for this user
        org = Organization.query.filter_by(user_id=user_id).first()
        if not org:
            # Auto-create organization if not exists
            org = Organization(name=f"{user.name}'s Organization", user_id=user_id)
            db.session.add(org)
            db.session.flush()
        
        project = Project(
            name=data['name'],
            lat=float(data['lat']),
            lon=float(data['lon']),
            address=data.get('address', ''),
            geofence_radius=data.get('geofence_radius', 100),
            org_id=org.id
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'id': project.id,
            'name': project.name,
            'lat': project.lat,
            'lon': project.lon,
            'address': project.address,
            'geofence_radius': project.geofence_radius,
            'org_id': project.org_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete a project"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check ownership
        org = Organization.query.get(project.org_id)
        if org.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': 'Project deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
