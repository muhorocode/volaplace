from flask import Blueprint, request, jsonify, session
from app import db
from app.models import Shift, Organization, User
from datetime import datetime

bp = Blueprint('shifts', __name__, url_prefix='/api/shifts')

@bp.route('/', methods=['POST'])
def create_shift():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if user.role != 'organization':
        return jsonify({'error': 'Only organizations can create shifts'}), 403
    
    # Get organization for this user
    organization = Organization.query.filter_by(user_id=user_id).first()
    if not organization:
        return jsonify({'error': 'Organization profile not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required = ['title', 'address', 'latitude', 'longitude', 'start_time', 'end_time']
    if not all(k in data for k in required):
        return jsonify({'error': f'Missing required fields: {required}'}), 400
    
    try:
        # Convert string dates to datetime objects
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    
    shift = Shift(
        organization_id=organization.id,
        title=data['title'],
        description=data.get('description', ''),
        address=data['address'],
        latitude=float(data['latitude']),
        longitude=float(data['longitude']),
        start_time=start_time,
        end_time=end_time,
        volunteers_needed=data.get('volunteers_needed', 1)
    )
    
    db.session.add(shift)
    db.session.commit()
    
    return jsonify({
        'message': 'Shift created successfully',
        'shift': shift.to_dict()
    }), 201

@bp.route('/', methods=['GET'])
def get_shifts():
    shifts = Shift.query.all()
    return jsonify({
        'shifts': [shift.to_dict() for shift in shifts]
    }), 200

@bp.route('/<int:shift_id>', methods=['GET'])
def get_shift(shift_id):
    shift = Shift.query.get_or_404(shift_id)
    return jsonify({
        'shift': shift.to_dict()
    }), 200

@bp.route('/<int:shift_id>', methods=['PUT'])
def update_shift(shift_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    shift = Shift.query.get_or_404(shift_id)
    organization = Organization.query.get(shift.organization_id)
    
    if organization.user_id != session['user_id']:
        return jsonify({'error': 'Not authorized'}), 403
    
    data = request.get_json()
    
    # Update fields if provided
    if 'title' in data:
        shift.title = data['title']
    if 'description' in data:
        shift.description = data['description']
    if 'address' in data:
        shift.address = data['address']
    if 'latitude' in data:
        shift.latitude = float(data['latitude'])
    if 'longitude' in data:
        shift.longitude = float(data['longitude'])
    if 'start_time' in data:
        try:
            shift.start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid start_time format'}), 400
    if 'end_time' in data:
        try:
            shift.end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid end_time format'}), 400
    if 'volunteers_needed' in data:
        shift.volunteers_needed = int(data['volunteers_needed'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Shift updated',
        'shift': shift.to_dict()
    }), 200

@bp.route('/<int:shift_id>', methods=['DELETE'])
def delete_shift(shift_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    shift = Shift.query.get_or_404(shift_id)
    organization = Organization.query.get(shift.organization_id)
    
    if organization.user_id != session['user_id']:
        return jsonify({'error': 'Not authorized'}), 403
    
    db.session.delete(shift)
    db.session.commit()
    
    return jsonify({'message': 'Shift deleted'}), 200
