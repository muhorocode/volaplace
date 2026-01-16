"""
Validation utilities for VolaPlace API
Prevents conflicts and ensures data integrity
"""
from app.models import User, Shift, ShiftRoster
from app.config import db


def validate_phone_unique(phone, exclude_user_id=None):
    """
    Check if a phone number is unique (not already in use)
    
    Args:
        phone: Phone number to check
        exclude_user_id: User ID to exclude from check (for updates)
    
    Returns:
        tuple: (is_valid, error_message)
    """
    query = User.query.filter(User.phone == phone)
    if exclude_user_id:
        query = query.filter(User.id != exclude_user_id)
    
    existing = query.first()
    if existing:
        return False, "Phone number already in use by another user"
    
    return True, None


def validate_shift_time_conflict(volunteer_id, shift_date, start_time, end_time, exclude_shift_id=None):
    """
    Check if a volunteer has time conflicts with existing shifts
    
    Args:
        volunteer_id: ID of the volunteer
        shift_date: Date of the shift
        start_time: Start time of the shift
        end_time: End time of the shift
        exclude_shift_id: Shift ID to exclude from check (for updates)
    
    Returns:
        tuple: (is_valid, error_message, conflicting_shift)
    """
    # Get all shifts the volunteer is registered for on the same date
    volunteer_shifts = db.session.query(Shift).join(
        ShiftRoster, Shift.id == ShiftRoster.shift_id
    ).filter(
        ShiftRoster.volunteer_id == volunteer_id,
        Shift.date == shift_date,
        ShiftRoster.status.in_(['registered', 'checked_in'])
    )
    
    if exclude_shift_id:
        volunteer_shifts = volunteer_shifts.filter(Shift.id != exclude_shift_id)
    
    volunteer_shifts = volunteer_shifts.all()
    
    # Check for time overlaps
    for v_shift in volunteer_shifts:
        if v_shift.start_time and v_shift.end_time:
            # Shifts overlap if one starts before the other ends
            if not (end_time <= v_shift.start_time or start_time >= v_shift.end_time):
                error_msg = (
                    f'Time conflict with shift "{v_shift.title}" '
                    f'({v_shift.start_time.strftime("%H:%M")} - {v_shift.end_time.strftime("%H:%M")})'
                )
                return False, error_msg, v_shift
    
    return True, None, None


def validate_organization_project_limit(user_id, max_projects=10):
    """
    Check if an organization has reached the project limit
    
    Args:
        user_id: ID of the organization admin user
        max_projects: Maximum number of projects allowed
    
    Returns:
        tuple: (is_valid, error_message)
    """
    from app.models import Organization
    
    org = Organization.query.filter_by(user_id=user_id).first()
    if org and len(org.projects) >= max_projects:
        return False, f"Maximum project limit ({max_projects}) reached"
    
    return True, None


def validate_volunteer_shift_limit(volunteer_id, shift_date, max_shifts=3):
    """
    Check if a volunteer has reached the daily shift limit
    
    Args:
        volunteer_id: ID of the volunteer
        shift_date: Date to check
        max_shifts: Maximum number of shifts per day
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Count shifts on the same date
    shift_count = db.session.query(Shift).join(
        ShiftRoster, Shift.id == ShiftRoster.shift_id
    ).filter(
        ShiftRoster.volunteer_id == volunteer_id,
        Shift.date == shift_date,
        ShiftRoster.status.in_(['registered', 'checked_in'])
    ).count()
    
    if shift_count >= max_shifts:
        return False, f"Maximum shifts per day ({max_shifts}) reached"
    
    return True, None
