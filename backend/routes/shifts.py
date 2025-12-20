"""
Shifts routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('shifts', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "shifts routes are working!"}), 200
