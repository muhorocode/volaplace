from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, date, time
from app.extensions import db
from app.models import VolunteerShift, Organization, ProjectLocation

shifts_bp = Blueprint('shifts', __name__)

@shifts_bp.route('', methods=['POST'])
@login_required
def create_shift():
    """create a new volunteer shift (organization only)"""
    if current_user.role != 'organization':
        return jsonify({'error': 'only organizations can create shifts'}), 403
    
    data = request.json
    required = ['title', 'location_id', 'shift_date', 'start_time', 'end_time']
    for field in required:
        if field not in data:
            return jsonify({'error': f'missing {field}'}), 400
    
    # verify organization owns the location
    org = Organization.query.filter_by(user_id=current_user.id).first()
    if not org:
        return jsonify({'error': 'organization profile not found'}), 404
    
    location = ProjectLocation.query.filter_by(
        id=data['location_id'],
        organization_id=org.id
    ).first()
    
    if not location:
        return jsonify({'error': 'location not found or not owned by organization'}), 404
    
    # parse date and time
    try:
        shift_date = date.fromisoformat(data['shift_date'])
        start_time = time.fromisoformat(data['start_time'])
        end_time = time.fromisoformat(data['end_time'])
    except ValueError:
        return jsonify({'error': 'invalid date or time format. use iso format: yyyy-mm-dd for date, hh:mm:ss for time'}), 400
    
    # create shift
    shift = VolunteerShift(
        location_id=location.id,
        title=data['title'],
        description=data.get('description', ''),
        shift_date=shift_date,
        start_time=start_time,
        end_time=end_time,
        required_volunteers=data.get('required_volunteers', 1),
        current_volunteers=0,
        status='active'
    )
    
    db.session.add(shift)
    db.session.commit()
    
    return jsonify({
        'message': 'shift created successfully',
        'shift': {
            'id': shift.id,
            'title': shift.title,
            'location_id': shift.location_id,
            'shift_date': shift.shift_date.isoformat(),
            'start_time': shift.start_time.isoformat(),
            'end_time': shift.end_time.isoformat()
        }
    }), 201

@shifts_bp.route('', methods=['GET'])
def get_shifts():
    """get all active shifts (public endpoint)"""
    shifts = VolunteerShift.query.filter_by(status='active').all()
    
    return jsonify({
        'shifts': [
            {
                'id': shift.id,
                'title': shift.title,
                'description': shift.description,
                'shift_date': shift.shift_date.isoformat(),
                'start_time': shift.start_time.isoformat(),
                'end_time': shift.end_time.isoformat(),
                'required_volunteers': shift.required_volunteers,
                'current_volunteers': shift.current_volunteers,
                'location_id': shift.location_id
            }
            for shift in shifts
        ]
    })

@shifts_bp.route('/organization', methods=['GET'])
@login_required
def get_organization_shifts():
    """get shifts for current organization"""
    if current_user.role != 'organization':
        return jsonify({'error': 'only organizations can view their shifts'}), 403
    
    org = Organization.query.filter_by(user_id=current_user.id).first()
    if not org:
        return jsonify({'error': 'organization profile not found'}), 404
    
    # get all locations for this organization
    locations = ProjectLocation.query.filter_by(organization_id=org.id).all()
    location_ids = [loc.id for loc in locations]
    
    # get shifts for these locations
    shifts = VolunteerShift.query.filter(VolunteerShift.location_id.in_(location_ids)).all()
    
    return jsonify({
        'shifts': [
            {
                'id': shift.id,
                'title': shift.title,
                'description': shift.description,
                'shift_date': shift.shift_date.isoformat(),
                'start_time': shift.start_time.isoformat(),
                'end_time': shift.end_time.isoformat(),
                'required_volunteers': shift.required_volunteers,
                'current_volunteers': shift.current_volunteers,
                'status': shift.status,
                'location_id': shift.location_id
            }
            for shift in shifts
        ]
    })

# test route
@shifts_bp.route('/test')
def test():
    return jsonify({'message': 'shifts real endpoints active'})
