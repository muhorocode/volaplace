"""
Attendance routes for VolaPlace - Check-in/Check-out with geofencing
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import ShiftRoster, Shift, Project, User
from datetime import datetime
import math

bp = Blueprint('attendance', __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates in meters using Haversine formula
    """
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance

@bp.route('/check-in', methods=['POST'])
@jwt_required()
def check_in():
    """
    Check in to a shift with geofence validation
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'volunteer':
        return jsonify({'error': 'Only volunteers can check in'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['shift_id', 'latitude', 'longitude']):
        return jsonify({'error': 'Missing required fields: shift_id, latitude, longitude'}), 400
    
    shift_id = data['shift_id']
    user_lat = float(data['latitude'])
    user_lon = float(data['longitude'])
    
    # Get shift and project
    shift = Shift.query.get(shift_id)
    if not shift:
        return jsonify({'error': 'Shift not found'}), 404
    
    project = Project.query.get(shift.project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Calculate distance from project location
    distance = calculate_distance(user_lat, user_lon, project.lat, project.lon)
    
    # Check geofence (project.geofence_radius is in meters)
    if distance > project.geofence_radius:
        return jsonify({
            'error': 'You are outside the geofence area',
            'distance': round(distance, 2),
            'required': project.geofence_radius,
            'message': f'You need to be within {project.geofence_radius}m of the project location'
        }), 403
    
    # Check if volunteer is registered for this shift
    roster_entry = ShiftRoster.query.filter_by(
        shift_id=shift_id,
        volunteer_id=user_id
    ).first()
    
    if not roster_entry:
        return jsonify({'error': 'You are not registered for this shift'}), 403
    
    # Check if already checked in
    if roster_entry.check_in_time:
        return jsonify({
            'error': 'Already checked in',
            'check_in_time': roster_entry.check_in_time.isoformat()
        }), 400
    
    # Perform check-in
    roster_entry.check_in_time = datetime.utcnow()
    roster_entry.status = 'checked_in'
    db.session.commit()
    
    return jsonify({
        'message': 'Checked in successfully',
        'check_in_time': roster_entry.check_in_time.isoformat(),
        'distance_from_site': round(distance, 2),
        'shift': {
            'id': shift.id,
            'title': shift.title,
            'project_name': project.name,
            'address': project.address
        }
    }), 200

@bp.route('/check-out', methods=['POST'])
@jwt_required()
def check_out():
    """
    Check out from a shift
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'volunteer':
        return jsonify({'error': 'Only volunteers can check out'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['shift_id', 'latitude', 'longitude']):
        return jsonify({'error': 'Missing required fields: shift_id, latitude, longitude'}), 400
    
    shift_id = data['shift_id']
    user_lat = float(data['latitude'])
    user_lon = float(data['longitude'])
    
    # Get shift and project
    shift = Shift.query.get(shift_id)
    if not shift:
        return jsonify({'error': 'Shift not found'}), 404
    
    project = Project.query.get(shift.project_id)
    
    # Calculate distance
    distance = calculate_distance(user_lat, user_lon, project.lat, project.lon)
    
    # Check geofence
    if distance > project.geofence_radius:
        return jsonify({
            'error': 'You are outside the geofence area',
            'distance': round(distance, 2),
            'required': project.geofence_radius
        }), 403
    
    # Get roster entry
    roster_entry = ShiftRoster.query.filter_by(
        shift_id=shift_id,
        volunteer_id=user_id
    ).first()
    
    if not roster_entry:
        return jsonify({'error': 'You are not registered for this shift'}), 403
    
    # Check if checked in
    if not roster_entry.check_in_time:
        return jsonify({'error': 'You have not checked in yet'}), 400
    
    # Check if already checked out
    if roster_entry.check_out_time:
        return jsonify({
            'error': 'Already checked out',
            'check_out_time': roster_entry.check_out_time.isoformat()
        }), 400
    
    # Perform check-out
    roster_entry.check_out_time = datetime.utcnow()
    roster_entry.status = 'completed'
    
    # Update beneficiaries if provided
    if 'beneficiaries_served' in data:
        roster_entry.beneficiaries_served = int(data['beneficiaries_served'])
    
    db.session.commit()
    
    # Calculate hours worked
    time_diff = roster_entry.check_out_time - roster_entry.check_in_time
    hours_worked = time_diff.total_seconds() / 3600
    
    return jsonify({
        'message': 'Checked out successfully',
        'check_out_time': roster_entry.check_out_time.isoformat(),
        'hours_worked': round(hours_worked, 2),
        'beneficiaries_served': roster_entry.beneficiaries_served,
        'payment_eligible': True,
        'shift': {
            'id': shift.id,
            'title': shift.title
        }
    }), 200

@bp.route('/shift/<int:shift_id>', methods=['GET'])
@jwt_required()
def get_shift_attendance(shift_id):
    """
    Get attendance records for a specific shift (org admins only)
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['org_admin', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get all roster entries for the shift
    roster_entries = ShiftRoster.query.filter_by(shift_id=shift_id).all()
    
    attendance = []
    for entry in roster_entries:
        volunteer = User.query.get(entry.volunteer_id)
        
        hours_worked = None
        if entry.check_in_time and entry.check_out_time:
            time_diff = entry.check_out_time - entry.check_in_time
            hours_worked = round(time_diff.total_seconds() / 3600, 2)
        
        attendance.append({
            'volunteer_id': entry.volunteer_id,
            'volunteer_name': volunteer.name,
            'status': entry.status,
            'check_in_time': entry.check_in_time.isoformat() if entry.check_in_time else None,
            'check_out_time': entry.check_out_time.isoformat() if entry.check_out_time else None,
            'hours_worked': hours_worked,
            'beneficiaries_served': entry.beneficiaries_served
        })
    
    return jsonify({
        'shift_id': shift_id,
        'total_volunteers': len(attendance),
        'checked_in': len([a for a in attendance if a['status'] in ['checked_in', 'completed']]),
        'completed': len([a for a in attendance if a['status'] == 'completed']),
        'attendance': attendance
    }), 200

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "attendance routes are working!"}), 200
