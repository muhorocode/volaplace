"""
Shifts routes for VolaPlace.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Shift, Project, Organization, User
from app.config import db
from datetime import datetime, time as dt_time

bp = Blueprint('shifts', __name__)

@bp.route('', methods=['POST'])
@jwt_required()
def create_shift():
    """Create a new shift"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role not in ['org_admin', 'admin']:
            return jsonify({'error': 'Only org admins can create shifts'}), 403
        
        data = request.get_json()
        
        # Validation
        required_fields = ['title', 'project_id', 'shift_date', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify project ownership
        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        org = Organization.query.get(project.org_id)
        if org.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Parse date and time
        shift_date = datetime.strptime(data['shift_date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        shift = Shift(
            project_id=data['project_id'],
            title=data['title'],
            description=data.get('description', ''),
            date=shift_date,
            start_time=start_time,
            end_time=end_time,
            max_volunteers=data.get('required_volunteers', 5),
            status='upcoming'
        )
        
        db.session.add(shift)
        db.session.commit()
        
        return jsonify({
            'id': shift.id,
            'title': shift.title,
            'description': shift.description,
            'date': shift.date.isoformat(),
            'start_time': shift.start_time.isoformat(),
            'end_time': shift.end_time.isoformat(),
            'project_id': shift.project_id,
            'status': shift.status
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['GET'])
@jwt_required()
def get_shifts():
    """Get all shifts - optionally filtered by project_id"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        project_id = request.args.get('project_id', type=int)
        
        query = Shift.query
        
        # If user is org_admin, only show their organization's shifts
        if user.role == 'org_admin':
            org = Organization.query.filter_by(user_id=user_id).first()
            if org:
                project_ids = [p.id for p in org.projects]
                query = query.filter(Shift.project_id.in_(project_ids))
        
        # Filter by specific project if requested
        if project_id:
            query = query.filter_by(project_id=project_id)
        
        shifts = query.order_by(Shift.date.desc()).all()
        
        return jsonify([{
            'id': s.id,
            'title': s.title,
            'description': s.description,
            'date': s.date.isoformat() if s.date else None,
            'start_time': s.start_time.isoformat() if s.start_time else None,
            'end_time': s.end_time.isoformat() if s.end_time else None,
            'max_volunteers': s.max_volunteers,
            'status': s.status,
            'project_id': s.project_id,
            'project': {
                'name': s.project.name,
                'lat': s.project.lat,
                'lon': s.project.lon,
                'geofence_radius': s.project.geofence_radius
            } if s.project else None
        } for s in shifts]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "shifts routes are working!"}), 200

