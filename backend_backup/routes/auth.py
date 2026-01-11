from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """register a new user (volunteer, organization, or admin)"""
    data = request.json
    
    # validate required fields
    required_fields = ['email', 'password', 'full_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'missing {field}'}), 400
    
    # validate role
    valid_roles = ['volunteer', 'organization', 'admin']
    if data['role'] not in valid_roles:
        return jsonify({'error': f'role must be one of: {", ".join(valid_roles)}'}), 400
    
    # check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'email already registered'}), 400
    
    # create new user
    new_user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        full_name=data['full_name'],
        role=data['role'],
        phone=data.get('phone', '')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'user registered successfully',
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'full_name': new_user.full_name,
            'role': new_user.role
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """login user and create session"""
    data = request.json
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'email and password required'}), 400
    
    # find user by email
    user_obj = User.query.filter_by(email=data['email']).first()
    
    # check password
    if not user_obj or not check_password_hash(user_obj.password_hash, data['password']):
        return jsonify({'error': 'invalid email or password'}), 401
    
    # login user
    login_user(user_obj)
    
    return jsonify({
        'message': 'login successful',
        'user': {
            'id': user_obj.id,
            'email': user_obj.email,
            'full_name': user_obj.full_name,
            'role': user_obj.role
        }
    })

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """logout current user"""
    logout_user()
    return jsonify({'message': 'logout successful'})

@auth_bp.route('/check', methods=['GET'])
@login_required
def check_auth():
    """check if user is authenticated"""
    from flask_login import current_user
    return jsonify({
        'authenticated': True,
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'role': current_user.role
        }
    })

# keep test route for now
@auth_bp.route('/test')
def test():
    return jsonify({'message': 'auth real endpoints active'})
