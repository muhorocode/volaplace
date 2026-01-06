"""
Auth routes for VolaPlace.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
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


@bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT token.
    Expected JSON: {
        "email": "user@example.com",
        "password": "securepassword"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Create JWT token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                "email": user.email,
                "role": user.role
            }
        )
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "phone": user.phone
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current logged-in user information.
    Requires: Authorization: Bearer <token>
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "phone": user.phone,
                "mpesa_phone": user.mpesa_phone,
                "profile_completed": user.profile_completed,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to get user: {str(e)}"}), 500


@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "auth routes are working!"}), 200
