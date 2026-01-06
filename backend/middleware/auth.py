"""
JWT authentication middleware for VolaPlace.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from app.models import User


def jwt_required_custom(fn):
    """
    Custom JWT required decorator that verifies token and loads user.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": f"Unauthorized: {str(e)}"}), 401
    return wrapper


def role_required(*allowed_roles):
    """
    Decorator to check if user has required role.
    Usage: @role_required('admin', 'org_admin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get('role')
                
                if user_role not in allowed_roles:
                    return jsonify({"error": f"Access denied. Required roles: {', '.join(allowed_roles)}"}), 403
                
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({"error": f"Unauthorized: {str(e)}"}), 401
        return wrapper
    return decorator


def get_current_user():
    """
    Get the current logged-in user from JWT token.
    Returns User object or None.
    """
    try:
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except:
        return None
