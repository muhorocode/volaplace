import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from extensions import db, migrate

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize with app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models here so Migrate sees them
    from app import models 

    # for admi cli command
    @app.cli.command("seed")
    def run_seed():
        from seed import seed_database
        seed_database()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)