import requests
import json

BASE_URL = "http://localhost:5000"

print("🎯 IMMEDIATE FLASK-LOGIN TEST")
print("=" * 50)

# 1. Login
print("\n1. Logging in...")
login_data = {
    "email": "comprehensive@test.com",
    "password": "test123"
}
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json=login_data,
    headers={"Content-Type": "application/json"}
)
print(f"   Login Status: {login_response.status_code}")
print(f"   Login Response: {login_response.json() if login_response.status_code == 200 else 'ERROR'}")

# Get session cookie
session_cookie = login_response.cookies.get('session')
print(f"   Session Cookie: {'SET' if session_cookie else 'NOT SET'}")

# 2. Test profile with session
print("\n2. Testing profile endpoint...")
if session_cookie:
    profile_response = requests.get(
        f"{BASE_URL}/api/users/profile",
        cookies={"session": session_cookie},
        headers={"Content-Type": "application/json"}
    )
    print(f"   Profile Status: {profile_response.status_code}")
    if profile_response.status_code == 200:
        print(f"   ✅ SUCCESS! Profile data: {profile_response.json()}")
    else:
        print(f"   ❌ FAILED: {profile_response.text[:200]}")
else:
    print("   ❌ No session cookie received!")

# 3. Also test with requests session (maintains cookies)
print("\n3. Testing with requests.Session()...")
session = requests.Session()
session.post(f"{BASE_URL}/api/auth/login", json=login_data)
profile_response2 = session.get(f"{BASE_URL}/api/users/profile")
print(f"   Session test Status: {profile_response2.status_code}")
if profile_response2.status_code == 200:
    print(f"   ✅ Session test SUCCESS! {profile_response2.json()}")
else:
    print(f"   ❌ Session test FAILED: {profile_response2.text[:200]}")
