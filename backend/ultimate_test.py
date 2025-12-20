import requests
import json

BASE_URL = "http://localhost:5000"

print("🎯 ULTIMATE FLASK-LOGIN TEST")
print("=" * 60)

# Use a fresh test user
TEST_EMAIL = "ultimate_test@test.com"
TEST_PASSWORD = "test123"

# 1. Register fresh user
print(f"\n1. Registering fresh user: {TEST_EMAIL}")
register_data = {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "name": "Ultimate Test",
    "role": "volunteer"
}

register_response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json=register_data,
    headers={"Content-Type": "application/json"}
)
print(f"   Status: {register_response.status_code}")

# 2. Login with proper session handling
print(f"\n2. Logging in...")
login_data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}

# Create a session object to maintain cookies
session = requests.Session()

# CRITICAL: Set headers for CORS
session.headers.update({
    "Content-Type": "application/json",
    "Origin": "http://localhost:5000"
})

login_response = session.post(
    f"{BASE_URL}/api/auth/login",
    json=login_data
)

print(f"   Login Status: {login_response.status_code}")
print(f"   Response Cookies: {dict(session.cookies)}")

# 3. Test profile endpoint
print("\n3. Testing profile endpoint...")
profile_response = session.get(f"{BASE_URL}/api/users/profile")

print(f"   Profile Status: {profile_response.status_code}")
if profile_response.status_code == 200:
    print(f"   ✅ SUCCESS! Profile works!")
    print(f"   Response: {json.dumps(profile_response.json(), indent=2)}")
elif profile_response.status_code == 302:
    print(f"   ❌ REDIRECTED (302)")
    print(f"   Location: {profile_response.headers.get('Location')}")
else:
    print(f"   ❌ Failed: {profile_response.text[:200]}")

# 4. Also test with direct cookie
print("\n4. Testing with direct cookie...")
if session.cookies.get('session'):
    cookie_value = session.cookies.get('session')
    
    # Test with curl-style request
    headers = {
        "Content-Type": "application/json",
        "Cookie": f"session={cookie_value}"
    }
    
    direct_response = requests.get(
        f"{BASE_URL}/api/users/profile",
        headers=headers
    )
    
    print(f"   Direct cookie Status: {direct_response.status_code}")
    if direct_response.status_code == 200:
        print(f"   ✅ Direct cookie works!")
    else:
        print(f"   ❌ Direct cookie failed: {direct_response.text[:100]}")
