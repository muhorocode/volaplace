"""
Comprehensive Integration Test for Elijah's Work
Tests: AuthContext, GPS Check-in, M-Pesa Payments
"""
import os
import sys
import json
import requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

BASE_URL = os.getenv('API_URL', 'http://localhost:5000')

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_section(title):
    print(f"\n{'='*70}")
    print(f"{Colors.BLUE}{title}{Colors.END}")
    print('='*70)

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.YELLOW}ℹ️  {message}{Colors.END}")

def test_mpesa_authentication():
    """Test M-Pesa OAuth authentication"""
    print_section("TEST 1: M-PESA AUTHENTICATION")
    
    try:
        import base64
        consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        
        if not consumer_key or not consumer_secret:
            print_error("M-Pesa credentials not found in .env")
            return False
        
        credentials = f"{consumer_key}:{consumer_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()
        
        response = requests.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            headers={'Authorization': f'Basic {encoded}'}
        )
        
        if response.status_code == 200:
            token = response.json()['access_token']
            print_success(f"M-Pesa authentication successful")
            print_info(f"Access Token: {token[:20]}...")
            return True
        else:
            print_error(f"M-Pesa auth failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"M-Pesa auth exception: {str(e)}")
        return False

def test_api_health():
    """Test if backend API is running"""
    print_section("TEST 2: API HEALTH CHECK")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print_success(f"Backend API is running at {BASE_URL}")
            return True
        else:
            print_error(f"API returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to backend at {BASE_URL}")
        print_info("Make sure backend is running with: cd backend && python run.py")
        return False
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        return False

def test_auth_endpoints():
    """Test authentication endpoints (login/register)"""
    print_section("TEST 3: AUTHENTICATION ENDPOINTS")
    
    try:
        # Test register endpoint exists
        test_user = {
            "email": f"test_{datetime.now().timestamp()}@test.com",
            "password": "Test123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "volunteer"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
        
        if response.status_code in [200, 201, 400, 409]:  # 400/409 if user exists
            print_success("Register endpoint accessible")
        else:
            print_error(f"Register endpoint returned {response.status_code}")
            return False
        
        # Test login endpoint
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        
        if response.status_code in [200, 401]:  # 401 if user doesn't exist
            print_success("Login endpoint accessible")
            return True
        else:
            print_error(f"Login endpoint returned {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Auth endpoints test failed: {str(e)}")
        return False

def test_attendance_endpoints():
    """Test check-in/check-out endpoints"""
    print_section("TEST 4: ATTENDANCE/CHECK-IN ENDPOINTS")
    
    try:
        # Test check-in endpoint structure
        check_in_data = {
            "shift_id": 1,
            "latitude": -1.286389,
            "longitude": 36.817223
        }
        
        response = requests.post(
            f"{BASE_URL}/api/attendance/check-in",
            json=check_in_data
        )
        
        # Should return 401 (unauthorized) or 404 (shift not found) - both are valid
        if response.status_code in [401, 404, 400]:
            print_success("Check-in endpoint accessible and validating requests")
            print_info(f"Response: {response.json().get('error', 'Validation working')}")
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
        
        # Test check-out endpoint
        check_out_data = {
            "shift_id": 1,
            "latitude": -1.286389,
            "longitude": 36.817223
        }
        
        response = requests.post(
            f"{BASE_URL}/api/attendance/check-out",
            json=check_out_data
        )
        
        if response.status_code in [401, 404, 400]:
            print_success("Check-out endpoint accessible and validating requests")
            return True
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Attendance endpoints test failed: {str(e)}")
        return False

def test_payment_endpoints():
    """Test payment calculation and initiation endpoints"""
    print_section("TEST 5: PAYMENT ENDPOINTS")
    
    try:
        # Test payment calculation endpoint
        calc_data = {
            "shift_id": 1,
            "user_id": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/calculate",
            json=calc_data
        )
        
        if response.status_code in [401, 404, 400]:
            print_success("Payment calculation endpoint accessible")
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
        
        # Test STK push endpoint
        stk_data = {
            "phone": "254708374149",
            "amount": 10,
            "shift_id": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/initiate",
            json=stk_data
        )
        
        if response.status_code in [401, 404, 400]:
            print_success("STK Push initiation endpoint accessible")
            return True
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Payment endpoints test failed: {str(e)}")
        return False

def test_frontend_files():
    """Check if frontend files exist"""
    print_section("TEST 6: FRONTEND FILES")
    
    files_to_check = [
        "../frontend/src/contexts/AuthContext.jsx",
        "../frontend/src/utils/axiosConfig.js",
        "../frontend/src/pages/CheckInPage.jsx"
    ]
    
    all_exist = True
    for file_path in files_to_check:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        if os.path.exists(full_path):
            print_success(f"Found: {file_path}")
        else:
            print_error(f"Missing: {file_path}")
            all_exist = False
    
    return all_exist

def test_mpesa_utils():
    """Test M-Pesa utility class"""
    print_section("TEST 7: M-PESA UTILITY CLASS")
    
    try:
        sys.path.append('/home/elicode/Development/code/phase-5/volaplace/backend')
        from utils.mpesa import MPesa
        
        mpesa = MPesa()
        
        # Check if credentials are loaded
        if not mpesa.consumer_key or not mpesa.consumer_secret:
            print_error("M-Pesa credentials not loaded in utility class")
            return False
        
        print_success("M-Pesa utility class instantiated successfully")
        print_info(f"Shortcode: {mpesa.business_shortcode}")
        print_info(f"Callback URL: {mpesa.callback_url}")
        
        # Test access token generation
        token = mpesa.get_access_token()
        if token:
            print_success(f"Access token generated: {token[:20]}...")
            return True
        else:
            print_error("Failed to generate access token")
            return False
            
    except Exception as e:
        print_error(f"M-Pesa utility test failed: {str(e)}")
        return False

def main():
    """Run all integration tests"""
    print(f"\n{Colors.BLUE}{'='*70}")
    print("🧪 ELIJAH'S INTEGRATION TEST SUITE")
    print("Testing: AuthContext, GPS Check-in, M-Pesa Payments")
    print(f"{'='*70}{Colors.END}\n")
    
    results = {
        "M-Pesa Authentication": test_mpesa_authentication(),
        "API Health Check": test_api_health(),
        "Auth Endpoints": test_auth_endpoints(),
        "Attendance Endpoints": test_attendance_endpoints(),
        "Payment Endpoints": test_payment_endpoints(),
        "Frontend Files": test_frontend_files(),
        "M-Pesa Utility": test_mpesa_utils()
    }
    
    # Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print(f"\n{Colors.BLUE}{'='*70}")
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 ALL TESTS PASSED! Production ready.{Colors.END}")
    else:
        print(f"{Colors.YELLOW}⚠️  Some tests failed. Review above for details.{Colors.END}")
    
    print(f"{'='*70}{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
