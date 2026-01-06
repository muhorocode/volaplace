"""
Auth routes for VolaPlace.
"""
from flask import Blueprint, request, jsonify
from app.models import User
from app.config import db

bp = Blueprint('auth', __name__)


@bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    Expected JSON: {
        "email": "user@example.com",
        "password": "securepassword",
        "phone": "254712345678",
        "role": "volunteer" or "org_admin"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'phone', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate role
        valid_roles = ['volunteer', 'org_admin', 'admin']
        if data['role'] not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 409
        
        if User.query.filter_by(phone=data['phone']).first():
            return jsonify({"error": "Phone number already registered"}), 409
        
        # Create new user
        new_user = User(
            name=data.get('name'),
            email=data['email'],
            role=data['role'],
            phone=data['phone'],
            mpesa_phone=data.get('mpesa_phone', data['phone'])
        )
        new_user.set_password(data['password'])
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "role": new_user.role,
                "phone": new_user.phone
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "auth routes are working!"}), 200
