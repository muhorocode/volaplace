from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Basic configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///volaplace.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'dev-key-for-today-please-change-in-production'
    
    # CRITICAL: Flask-Login session configuration
    app.config['SESSION_COOKIE_SECURE'] = False  # True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['REMEMBER_COOKIE_DURATION'] = 3600
    app.config['REMEMBER_COOKIE_SECURE'] = False
    app.config['REMEMBER_COOKIE_HTTPONLY'] = True
    
    # CRITICAL: CORS configuration for credentials
    CORS(app, 
         supports_credentials=True,
         origins=["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:5000"],
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    migrate.init_app(app, db)
    
    # Import and register blueprints
    blueprints = [
        ('auth', 'auth'),
        ('users', 'users'),
        ('organizations', 'orgs'),
        ('shifts', 'shifts'),
        ('api', 'api')
    ]
    
    for module_name, bp_name in blueprints:
        try:
            module = __import__(f'app.routes.{module_name}', fromlist=['bp'])
            bp = getattr(module, 'bp')
            app.register_blueprint(bp)
            print(f"✅ {module_name.capitalize()} blueprint registered")
        except ImportError as e:
            print(f"⚠️  Skipping {module_name}: {e}")
        except AttributeError:
            print(f"⚠️  {module_name}.py doesn't have 'bp' variable")
    
    # Import models for Flask-Login
    from app.models import User
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Create tables
    with app.app_context():
        db.create_all()
        print("✅ Database tables created")
    
    return app
