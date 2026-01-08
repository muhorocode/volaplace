from flask import jsonify

def register_error_handlers(app):
    '''register error handlers for the application'''
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'bad request', 'message': str(error)}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'unauthorized', 'message': 'authentication required'}), 401
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'not found', 'message': 'resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({'error': 'internal server error', 'message': 'something went wrong'}), 500
