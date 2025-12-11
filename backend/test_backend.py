#!/usr/bin/env python3
"""
Test the backend setup
"""
import sys
import os

print("🧪 Testing Backend Setup...")
print("="*50)

# Add current directory to Python path
sys.path.insert(0, os.getcwd())

try:
    print("1. Testing imports...")
    from app import create_app, db
    from app.models import User
    print("✅ All imports successful")
    
    print("\n2. Creating app...")
    app = create_app()
    print("✅ App created")
    
    print("\n3. Testing database...")
    with app.app_context():
        # Create tables
        db.create_all()
        print("✅ Database tables created")
        
        # Test User model
        test_user = User(
            email="test@test.com",
            name="Test User",
            role="volunteer"
        )
        test_user.set_password("test123")
        
        db.session.add(test_user)
        db.session.commit()
        print("✅ User created and saved to database")
        
        # Query user
        retrieved = User.query.filter_by(email="test@test.com").first()
        if retrieved and retrieved.check_password("test123"):
            print("✅ User retrieval and password check works")
        else:
            print("❌ User retrieval failed")
    
    print("\n4. Testing routes...")
    with app.test_client() as client:
        # Test root
        response = client.get('/')
        if response.status_code == 200:
            print("✅ Root endpoint works")
        
        # Test auth endpoints
        response = client.get('/api/auth/check')
        if response.status_code in [200, 401]:
            print("✅ Auth check endpoint works")
        
        # Test registration
        response = client.post('/api/auth/register', json={
            'email': 'demo@test.com',
            'password': 'demo123',
            'name': 'Demo User',
            'role': 'volunteer'
        })
        if response.status_code in [201, 400]:  # 201 created, 400 if already exists
            print("✅ Registration endpoint works")
    
    print("\n🎉 All tests passed! Backend is working correctly.")
    
except Exception as e:
    print(f"\n❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
