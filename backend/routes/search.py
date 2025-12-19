from flask import Blueprint, jsonify
from app.models import Shift
from app.config import db

# create the blueprint
api_bp = Blueprint('api', __name__)

# get all shifts
# ready for get shifts search logic.
@api_bp.route('/api/shifts', methods=['GET'])
def get_shifts():
    shifts = Shift.query.all()
    return jsonify([s.to_dict() for s in shifts])

