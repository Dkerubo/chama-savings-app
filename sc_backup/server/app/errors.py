from flask import jsonify

def register_error_handlers(app):
    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({
            'error': 'Bad Request',
            'message': str(e) if str(e) else 'Invalid request data'
        }), 400

    @app.errorhandler(401)
    def handle_unauthorized(e):
        return jsonify({
            'error': 'Unauthorized',
            'message': str(e) if str(e) else 'Authentication required'
        }), 401

    @app.errorhandler(403)
    def handle_forbidden(e):
        return jsonify({
            'error': 'Forbidden',
            'message': str(e) if str(e) else 'Insufficient permissions'
        }), 403

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            'error': 'Not Found',
            'message': str(e) if str(e) else 'Resource not found'
        }), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({
            'error': 'Method Not Allowed',
            'message': str(e) if str(e) else 'The method is not allowed for the requested URL'
        }), 405

    @app.errorhandler(422)
    def handle_unprocessable_entity(e):
        return jsonify({
            'error': 'Unprocessable Entity',
            'message': str(e) if str(e) else 'Request was well-formed but contains semantic errors'
        }), 422

    @app.errorhandler(500)
    def handle_internal_server_error(e):
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e) if str(e) else 'An internal server error occurred'
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        app.logger.error(f'Unhandled exception: {str(e)}')
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500
