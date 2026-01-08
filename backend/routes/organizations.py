"""
Organizations routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('organizations', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "organizations routes are working!"}), 200
