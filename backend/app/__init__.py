import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db, migrate

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # CORS Setup
    allowed_origins = [
        "https://volaplace-ten.vercel.app",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    CORS(app, origins=allowed_origins)

    # database config
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, '..', 'app.db')}"
    )
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
    from .routes import api_bp
    app.register_blueprint(api_bp)

    # CLI seed command (flask seed)
    @app.cli.command("seed")
    def run_seed():
        from seed import seed_database
        seed_database()

    return app