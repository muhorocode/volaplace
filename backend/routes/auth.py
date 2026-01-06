"""
Auth routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('auth', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "auth routes are working!"}), 200
