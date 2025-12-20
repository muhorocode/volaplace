from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'role']
        if not all(k in data for k in required_fields):
            return jsonify({'error': f'Missing required fields. Need: {required_fields}'}), 400
        
        # Check if user exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Validate role
        valid_roles = ['volunteer', 'organization', 'admin']
        if data['role'] not in valid_roles:
            return jsonify({'error': f'Role must be one of: {", ".join(valid_roles)}'}), 400
        
        # Create new user
        new_user = User(
            email=data['email'],
            name=data['name'],
            role=data['role'],
            phone=data.get('phone')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Set session
        session['user_id'] = new_user.id
        session['user_role'] = new_user.role
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Set session
        session['user_id'] = user.id
        session['user_role'] = user.role
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/check', methods=['GET'])
def check_auth():
    if 'user_id' not in session:
        return jsonify({'authenticated': False}), 200
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        session.clear()
        return jsonify({'authenticated': False}), 200
    
    return jsonify({
        'authenticated': True,
        'user': user.to_dict()
    }), 200

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200