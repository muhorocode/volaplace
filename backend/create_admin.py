"""
Quick script to create an admin user for VolaPlace
Run: python create_admin.py
"""
from app import create_app
from app.config import db
from app.models import User

def create_admin():
    app = create_app()
    
    with app.app_context():
        print("🔑 Creating Admin Account...")
        
        # Check if admin already exists
        existing = User.query.filter_by(email='admin@volaplace.com').first()
        if existing:
            print(f"⚠️  Admin already exists!")
            print(f"📧 Email: admin@volaplace.com")
            print(f"🔐 Password: Admin123!")
            print(f"👤 Name: {existing.name}")
            return
        
        # Create new admin
        admin = User(
            name='System Administrator',
            email='admin@volaplace.com',
            role='admin',
            phone='254700000000',
            mpesa_phone='254700000000',
            profile_completed=True
        )
        admin.set_password('Admin123!')
        
        db.session.add(admin)
        db.session.commit()
        
        print("✅ Admin account created successfully!")
        print("\n📋 Login Credentials:")
        print("   Email: admin@volaplace.com")
        print("   Password: Admin123!")
        print("\n🔗 Login at: http://localhost:5173")

if __name__ == "__main__":
    create_admin()
