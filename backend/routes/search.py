from flask import Blueprint, jsonify, request
from app.models import Shift
from app.config import db
from utils.geo import calculate_distance

# create the blueprint
api_bp = Blueprint('api', __name__)

# get all shifts
# ready for get shifts search logic.
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

        # if user provided GPS calculate distance to project site.
        if user_lat is not None and user_log is not None:
            dist = calculate_distance(user_lat, user_log, shift.project.latitude, shift.project.longitude)
            shift_data['distance_km'] = dist
        else:
            shift_data['distance_km'] = None
        shifts_list.append(shift_data)

    #sort by distance if coordinates were provided.
    if user_lat is not None and user_log is not None:
        # shifts with calculated distance come first.
        # sorted smallest to largest.
        shifts_list.sort(
            key=lambda x:
            x['distance_km']
            if x['distance_km'] is not None
            else float('inf')
        )
    
    return jsonify(shifts_list), 200





