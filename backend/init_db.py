#!/usr/bin/env python3
"""
Initialize the database
"""
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

app = create_app()

with app.app_context():
    print("��️  Cleaning up old database...")
    try:
        # Try to drop all tables
        db.drop_all()
        print("✅ Dropped all tables")
    except:
        print("⚠️  Could not drop tables (might not exist)")
    
    print("🔄 Creating all tables...")
    db.create_all()
    
    print("✅ Database initialized successfully!")
    print("📁 Database file should be: instance/volaplace.db")
