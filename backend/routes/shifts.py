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
        user_id = int(get_jwt_identity())
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
        from datetime import datetime as dt, timedelta
        user_id = int(get_jwt_identity())
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
        
        # Auto-update shift status based on current time
        now = dt.now()
        for s in shifts:
            if s.date and s.start_time:
                # Combine date and time
                shift_datetime = dt.combine(s.date, s.start_time)
                # Add 1 minute buffer
                start_threshold = shift_datetime + timedelta(minutes=1)
                
                if s.status == 'upcoming' and now >= start_threshold:
                    s.status = 'in_progress'
                    db.session.add(s)
        
        db.session.commit()
        
        # For volunteers, include their roster entry status
        result = []
        for s in shifts:
            shift_data = {
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
                } if s.project else None,
                'volunteers_signed_up': len(s.roster_entries) if s.roster_entries else 0
            }
            
            # If user is a volunteer, include their roster entry status
            if user.role == 'volunteer':
                from app.models import ShiftRoster
                roster_entry = ShiftRoster.query.filter_by(
                    shift_id=s.id,
                    volunteer_id=user_id
                ).first()
                
                if roster_entry:
                    shift_data['roster_status'] = roster_entry.status
                    shift_data['check_in_time'] = roster_entry.check_in_time.isoformat() if roster_entry.check_in_time else None
                    shift_data['check_out_time'] = roster_entry.check_out_time.isoformat() if roster_entry.check_out_time else None
                    shift_data['payout_amount'] = roster_entry.payout_amount
                    shift_data['beneficiaries_served'] = roster_entry.beneficiaries_served
                    # Override shift status with roster status for volunteer's view
                    shift_data['status'] = roster_entry.status
            
            result.append(shift_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "shifts routes are working!"}), 200


@bp.route('/<int:shift_id>', methods=['PUT'])
@jwt_required()
def update_shift(shift_id):
    """Update a shift"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        shift = Shift.query.get(shift_id)
        if not shift:
            return jsonify({'error': 'Shift not found'}), 404
        
        # Verify ownership
        project = Project.query.get(shift.project_id)
        org = Organization.query.get(project.org_id)
        if org.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            shift.title = data['title']
        if 'description' in data:
            shift.description = data['description']
        if 'shift_date' in data:
            shift.date = datetime.strptime(data['shift_date'], '%Y-%m-%d').date()
        if 'start_time' in data:
            shift.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        if 'end_time' in data:
            shift.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        if 'required_volunteers' in data:
            shift.max_volunteers = data['required_volunteers']
        if 'status' in data:
            shift.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Shift updated successfully',
            'shift': {
                'id': shift.id,
                'title': shift.title,
                'description': shift.description,
                'date': shift.date.isoformat() if shift.date else None,
                'start_time': shift.start_time.isoformat() if shift.start_time else None,
                'end_time': shift.end_time.isoformat() if shift.end_time else None,
                'max_volunteers': shift.max_volunteers,
                'status': shift.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:shift_id>', methods=['DELETE'])
@jwt_required()
def delete_shift(shift_id):
    """Delete a shift"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        shift = Shift.query.get(shift_id)
        if not shift:
            return jsonify({'error': 'Shift not found'}), 404
        
        # Verify ownership
        project = Project.query.get(shift.project_id)
        org = Organization.query.get(project.org_id)
        if org.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check if shift has volunteers assigned
        if shift.roster_entries and len(shift.roster_entries) > 0:
            return jsonify({'error': 'Cannot delete shift with assigned volunteers'}), 400
        
        db.session.delete(shift)
        db.session.commit()
        
        return jsonify({'message': 'Shift deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:shift_id>/register', methods=['POST'])
@jwt_required()
def register_for_shift(shift_id):
    """Register a volunteer for a shift"""
    try:
        from app.models import ShiftRoster
        
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role != 'volunteer':
            return jsonify({'error': 'Only volunteers can register for shifts'}), 403
        
        shift = Shift.query.get(shift_id)
        if not shift:
            return jsonify({'error': 'Shift not found'}), 404
        
        if shift.status != 'upcoming':
            return jsonify({'error': 'Can only register for upcoming shifts'}), 400
        
        # Check if already registered
        existing = ShiftRoster.query.filter_by(
            shift_id=shift_id, 
            volunteer_id=user_id
        ).first()
        
        if existing:
            return jsonify({'error': 'Already registered for this shift'}), 400
        
        # Check if shift is full
        current_count = ShiftRoster.query.filter_by(shift_id=shift_id).count()
        if current_count >= shift.max_volunteers:
            return jsonify({'error': 'Shift is full'}), 400
        
        # Create roster entry
        roster_entry = ShiftRoster(
            shift_id=shift_id,
            volunteer_id=user_id,
            status='registered'
        )
        
        db.session.add(roster_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully registered for shift',
            'roster_id': roster_entry.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:shift_id>/checkin', methods=['POST'])
@jwt_required()
def checkin_shift(shift_id):
    """Check in to a shift"""
    try:
        from app.models import ShiftRoster
        from datetime import datetime
        
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role != 'volunteer':
            return jsonify({'error': 'Only volunteers can check in'}), 403
        
        shift = Shift.query.get(shift_id)
        if not shift:
            return jsonify({'error': 'Shift not found'}), 404
        
        # Find roster entry
        roster_entry = ShiftRoster.query.filter_by(
            shift_id=shift_id, 
            volunteer_id=user_id
        ).first()
        
        if not roster_entry:
            # Auto-register if not already registered
            roster_entry = ShiftRoster(
                shift_id=shift_id,
                volunteer_id=user_id,
                status='registered'
            )
            db.session.add(roster_entry)
        
        if roster_entry.check_in_time:
            return jsonify({'error': 'Already checked in'}), 400
        
        roster_entry.check_in_time = datetime.utcnow()
        roster_entry.status = 'checked_in'
        
        # Update shift status to in_progress when first volunteer checks in
        if shift.status == 'upcoming':
            shift.status = 'in_progress'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Checked in successfully',
            'check_in_time': roster_entry.check_in_time.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:shift_id>/checkout', methods=['POST'])
@jwt_required()
def checkout_shift(shift_id):
    """Check out from a shift"""
    try:
        from app.models import ShiftRoster, GlobalRules, TransactionLog
        from datetime import datetime
        
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role != 'volunteer':
            return jsonify({'error': 'Only volunteers can check out'}), 403
        
        data = request.get_json() or {}
        beneficiaries_served = data.get('beneficiaries_served', 0)
        
        shift = Shift.query.get(shift_id)
        if not shift:
            return jsonify({'error': 'Shift not found'}), 404
        
        # Find roster entry
        roster_entry = ShiftRoster.query.filter_by(
            shift_id=shift_id, 
            volunteer_id=user_id
        ).first()
        
        if not roster_entry:
            return jsonify({'error': 'Not registered for this shift'}), 404
        
        if not roster_entry.check_in_time:
            return jsonify({'error': 'Must check in first'}), 400
        
        if roster_entry.check_out_time:
            return jsonify({'error': 'Already checked out'}), 400
        
        roster_entry.check_out_time = datetime.utcnow()
        roster_entry.beneficiaries_served = beneficiaries_served
        roster_entry.status = 'completed'
        
        # Calculate payment
        time_diff = roster_entry.check_out_time - roster_entry.check_in_time
        hours_worked = time_diff.total_seconds() / 3600
        
        rules = GlobalRules.query.first()
        base_rate = rules.base_hourly_rate if rules else 100.0
        bonus_per_beneficiary = rules.bonus_per_beneficiary if rules else 10.0
        
        base_payment = hours_worked * base_rate
        beneficiary_bonus = beneficiaries_served * bonus_per_beneficiary
        total_amount = base_payment + beneficiary_bonus
        
        roster_entry.payout_amount = total_amount
        
        db.session.commit()
        
        return jsonify({
            'message': 'Checked out successfully',
            'check_out_time': roster_entry.check_out_time.isoformat(),
            'hours_worked': round(hours_worked, 2),
            'beneficiaries_served': beneficiaries_served,
            'payout_amount': round(total_amount, 2)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:shift_id>', methods=['GET'])
@jwt_required()
def get_shift_details(shift_id):
    """Get details of a specific shift"""
    try:
        shift = Shift.query.get(shift_id)
        if not shift:
            return jsonify({'error': 'Shift not found'}), 404
        
        project = shift.project
        
        return jsonify({
            'id': shift.id,
            'title': shift.title,
            'description': shift.description,
            'date': shift.date.isoformat() if shift.date else None,
            'start_time': shift.start_time.isoformat() if shift.start_time else None,
            'end_time': shift.end_time.isoformat() if shift.end_time else None,
            'max_volunteers': shift.max_volunteers,
            'status': shift.status,
            'project': {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'lat': project.lat,
                'lon': project.lon,
                'geofence_radius': project.geofence_radius
            } if project else None,
            'volunteers_registered': len(shift.roster_entries) if shift.roster_entries else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

