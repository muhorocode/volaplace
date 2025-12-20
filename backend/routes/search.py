"""
Search routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('search', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "search routes are working!"}), 200
