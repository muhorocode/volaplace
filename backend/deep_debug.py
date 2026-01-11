import sys
sys.path.insert(0, '.')

from app import create_app
from app.models import User
from flask_login import LoginManager, UserMixin, current_user
from flask import g
import json

app = create_app()

print("🔍 DEEP FLASK-LOGIN DEBUGGING")
print("=" * 60)

with app.app_context():
    # 1. Check login_manager setup
    print("1. Flask-Login Manager:")
    print(f"   - Has login_manager: {hasattr(app, 'login_manager')}")
    if hasattr(app, 'login_manager'):
        lm = app.login_manager
        print(f"   - login_view: {lm.login_view}")
        print(f"   - is setup: {lm._login_disabled}")
        
        # Check user_loader
        if lm._user_callback:
            print(f"   - user_loader is SET")
        else:
            print(f"   - ❌ user_loader is NOT SET!")
    
    # 2. Check a specific user
    user = User.query.filter_by(email="comprehensive@test.com").first()
    if user:
        print(f"\n2. User found: {user.email} (ID: {user.id})")
        
        # Check UserMixin inheritance
        print(f"   - Inherits UserMixin: {isinstance(user, UserMixin)}")
        
        # Check required methods
        required = ['is_authenticated', 'is_active', 'is_anonymous', 'get_id']
        for method in required:
            if hasattr(user, method):
                try:
                    result = getattr(user, method)
                    if callable(result):
                        result = result()
                    print(f"   - {method}: {result}")
                except:
                    print(f"   - {method}: ERROR calling")
            else:
                print(f"   - ❌ Missing {method}")
    else:
        print("❌ User not found!")
    
    # 3. Create a test request context
    print("\n3. Testing in request context...")
    with app.test_client() as client:
        # Login
        response = client.post('/api/auth/login', json={
            'email': 'comprehensive@test.com',
            'password': 'test123'
        })
        print(f"   Login status: {response.status_code}")
        
        # Check if session was set
        session_cookie = response.headers.get('Set-Cookie')
        print(f"   Session cookie in response: {'YES' if session_cookie else 'NO'}")
        
        # Try to access profile
        if session_cookie:
            # Extract session value
            import re
            match = re.search(r'session=([^;]+)', session_cookie)
            if match:
                session_value = match.group(1)
                print(f"   Session value: {session_value[:50]}...")
                
                # Make request with session
                response2 = client.get('/api/users/profile', headers={
                    'Cookie': f'session={session_value}'
                })
                print(f"   Profile status: {response2.status_code}")
                print(f"   Profile response: {response2.get_data(as_text=True)[:200]}")
            else:
                print("   ❌ Could not extract session from cookie")
