import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from .config import db, migrate

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # CORS Setup
    allowed_origins = [
        "https://volaplace-api.onrender.com",
        "https://volaplace.vercel.app",
        "http://localhost:5173",
    ]
    CORS(app, origins=allowed_origins)

    # from .env for local.
    uri = os.environ.get('DATABASE_URL')
    
    # Validate DATABASE_URL is set
    if not uri:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Please set it in your .env file (local) or Render environment variables (production)."
        )

    # handle both render and local postgres connections.
    if uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT Configuration - tokens expire after 24 hours
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

    # Initialize database, migrations, and JWT
    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)

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

    # Register API blueprints
    from routes.search import api_bp
    from routes.auth import bp as auth_bp
    from routes.users import bp as users_bp
    from routes.organizations import bp as orgs_bp
    from routes.shifts import bp as shifts_bp
    from routes.attendance import bp as attendance_bp
    from routes.payments import bp as payments_bp
    
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')  # Auth routes under /api/auth
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(orgs_bp, url_prefix='/api/organizations')
    app.register_blueprint(shifts_bp, url_prefix='/api/shifts')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')

    # CLI seed command (flask seed)
    @app.cli.command("seed")
    def run_seed():
        from seed import seed_database
        seed_database()

    return app

