from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    allowed_origins = [
        "https://volaplace.vercel.app",  # vercel URL
        "http://localhost:3000", # for local development
    ]
    CORS(app,origins=allowed_origins)
    
    @app.route('/')
    def index():
        return jsonify({"message": "VolaPlace API Running"})
    
    @app.route('/api/health')
    def health():
        return jsonify({"status": "healthy"})
    
    return app
