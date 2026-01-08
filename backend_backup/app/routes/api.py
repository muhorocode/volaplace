from flask import Blueprint, jsonify

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'service': 'VolaPlace API',
        'version': '1.0'
    }), 200

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API endpoint working'}), 200
