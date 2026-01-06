"""
Payments routes for VolaPlace.
"""
from flask import Blueprint, jsonify

bp = Blueprint('payments', __name__)

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "payments routes are working!"}), 200
