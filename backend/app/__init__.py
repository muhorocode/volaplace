import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .config import db, migrate

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # CORS Setup
    allowed_origins = [
        "https://volaplace-api.onrender.com",
        "http://localhost:5173",
    ]
    CORS(app, origins=allowed_origins)

    # from .env for local.
    uri = os.environ.get('DATABASE_URL')

    # handle both render and local postgres connections.
    if uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # import models inside factory.
    # this prevents circular imports and registers models with SQLAlchemy
    with app.app_context():
        from . import models

    # simple routes.
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "VolaPlace API Running"})
    
    # endpoint health check.
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "healthy"})

    # blueprint
    from routes.search import api_bp
    app.register_blueprint(api_bp)

    # CLI seed command (flask seed)
    @app.cli.command("seed")
    def run_seed():
        from seed import seed_database
        seed_database()

    return app