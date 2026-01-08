from flask import Blueprint, jsonify, request
from app.models import Shift
from app.config import db
from utils.geo import calculate_distance

# create the blueprint
api_bp = Blueprint('api', __name__)

# get shifts  - search logic - http://localhost:5000/api/shifts?lat=-1.26&log=36.8 
@api_bp.route('/api/shifts', methods=['GET'])
def get_shifts():
    # get user cordinates from query parameters.
    user_lat = request.args.get("lat", type = float)
    user_log = request.args.get("log", type=float)

    # fetch all active shifts.
    all_shifts = Shift.query.all()
    shifts_list = []

    for shift in all_shifts:
        shift_data = shift.to_dict()

        print(f"shift: {user_lat}, {user_log} | Project: {shift.project.lat if shift.project else 'NO PROJECT'}")
        # if user provided GPS calculate distance to project site 
        if user_lat is not None and user_log is not None:
            distance = calculate_distance(user_lat, user_log, shift.project.lat, shift.project.lon)
            shift_data['distance_km'] = distance
            
            # get given radius else 100 by default.
            radius = shift.project.geofence_radius or 100
            shift_data['is_within_radius'] = distance <= radius
        else:
            shift_data['distance_km'] = None
            shift_data['is_within_radius'] = False

        shifts_list.append(shift_data)

    # sort by distances if coordinates were provided.
    if user_lat is not None and user_log is not None:
        # shifts with calculated distance come first - sorted closest first.
        shifts_list.sort( key = lambda x: x['distance_km'] if x['distance_km'] is not None else float('inf') )
    
    return jsonify(shifts_list), 200

