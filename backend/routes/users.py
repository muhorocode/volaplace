"""
Users routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('users', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "users routes are working!"}), 200
