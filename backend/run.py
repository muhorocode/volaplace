import os
from flask import Flask, jsonify  # Added jsonify
from flask_cors import CORS       # Added CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from extensions import db, migrate

load_dotenv()

def create_app():
    app = Flask(__name__)
 
    allowed_origins = [
        "https://volaplace-ten.vercel.app",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    CORS(app, origins=allowed_origins)

    # 2. Database Config
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 3. Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # 4. Your Routes (Moved from your other file)
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "VolaPlace API Running"})
    
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "healthy"})

    # Import models for Migrate
    # Note: Ensure your models folder/file is named correctly
    # from app import models 

    @app.cli.command("seed")
    def run_seed():
        from seed import seed_database
        seed_database()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)