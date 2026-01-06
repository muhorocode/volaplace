"""
Attendance routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('attendance', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "attendance routes are working!"}), 200
