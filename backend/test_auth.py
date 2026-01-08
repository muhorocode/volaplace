#!/usr/bin/env python3
"""
Test script for authentication endpoints.
Make sure the server is running: python run.py
"""
import requests
import json

BASE_URL = "http://localhost:5000/api/auth"

def test_registration():
    """Test user registration"""
    print("\n🧪 Testing Registration...")
    print("=" * 50)
    
    data = {
        "email": "elijah@test.com",
        "password": "test123",
        "phone": "254712345678",
        "role": "volunteer",
        "name": "Elijah Test"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            return True
        elif response.status_code == 409:
            print("⚠️  User already exists (expected if running multiple times)")
            return True
        else:
            print("❌ Registration failed!")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server not running! Start it with: python run.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_login():
    """Test user login"""
    print("\n🧪 Testing Login...")
    print("=" * 50)
    
    data = {
        "email": "elijah@test.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            token = response.json().get('access_token')
            return token
        else:
            print("❌ Login failed!")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def test_get_current_user(token):
    """Test getting current user with token"""
    print("\n🧪 Testing Get Current User...")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/me", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Got current user successfully!")
            return True
        else:
            print("❌ Failed to get current user!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_invalid_login():
    """Test login with wrong credentials"""
    print("\n🧪 Testing Invalid Login...")
    print("=" * 50)
    
    data = {
        "email": "elijah@test.com",
        "password": "wrongpassword"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 401:
            print("✅ Correctly rejected invalid credentials!")
            return True
        else:
            print("❌ Should have rejected invalid credentials!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("🚀 AUTHENTICATION ENDPOINT TESTS")
    print("=" * 50)
    print("Make sure server is running: python run.py")
    print("=" * 50)
    
    results = []
    
    # Test 1: Registration
    results.append(("Registration", test_registration()))
    
    # Test 2: Login
    token = test_login()
    results.append(("Login", token is not None))
    
    # Test 3: Get current user (protected route)
    if token:
        results.append(("Get Current User", test_get_current_user(token)))
    else:
        results.append(("Get Current User", False))
    
    # Test 4: Invalid credentials
    results.append(("Invalid Login", test_invalid_login()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
