from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Basic configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///volaplace.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'dev-key-for-today'
    
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import and register blueprints - with error handling
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
    
    return app
