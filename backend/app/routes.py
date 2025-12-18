from flask import Blueprint, jsonify
from .models import User, Organization, Project, Shift, ShiftRoster, GlobalRules, TransactionLog
from extensions import db

# create the blueprint
api_bp = Blueprint('api', __name__)

# get all shifts
@api_bp.route('/api/shifts', methods=['GET'])
def get_shifts():
    shifts = Shift.query.all()
    return jsonify([s.to_dict() for s in shifts])

# get all users
@api_bp.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


