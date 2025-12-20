from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Basic config
    app.config['SECRET_KEY'] = 'dev-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///volaplace.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # ===== ROUTES =====
    
    @app.route('/')
    def home():
        return {
            'message': 'VolaPlace API v1.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth/*',
                'organizations': '/api/organizations/*',
                'shifts': '/api/shifts/*',
                'users': '/api/users/*',
                'search': '/api/search/*',
                'attendance': '/api/attendance/*',
                'payments': '/api/payments/*'
            }
        }
    
    @app.route('/api/health')
    def api_health():
        return {'status': 'healthy', 'service': 'VolaPlace API'}
    
    # Register blueprints
    blueprints = [
        ('auth', '/api/auth'),
        ('organizations', '/api/organizations'),
        ('shifts', '/api/shifts'),
        ('users', '/api/users'),
        ('search', '/api/search'),
        ('attendance', '/api/attendance'),
        ('payments', '/api/payments')
    ]
    
    for module_name, url_prefix in blueprints:
        try:
            module = __import__(f'routes.{module_name}', fromlist=['bp'])
            bp = getattr(module, 'bp')
            app.register_blueprint(bp, url_prefix=url_prefix)
            print(f"✅ {module_name.capitalize()} blueprint registered")
        except Exception as e:
            print(f"⚠️  {module_name}: {e}")
            # Create fallback
            @app.route(f'{url_prefix}/test')
            def fallback():
                return {'message': f'{module_name} routes'}, 200
    
    print(f"🎯 Total blueprints: {len(app.blueprints)}")
    return app
