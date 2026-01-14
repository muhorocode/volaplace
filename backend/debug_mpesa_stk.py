#!/usr/bin/env python3
"""
M-Pesa STK Push Debug Script
Tests M-Pesa integration with detailed logging
"""

import os
import sys
import requests
import base64
from datetime import datetime

def test_mpesa_credentials():
    """Test M-Pesa credentials and configuration"""
    
    print("="*80)
    print("M-PESA CONFIGURATION DEBUG")
    print("="*80)
    print()
    
    # Get environment variables
    consumer_key = os.getenv('MPESA_CONSUMER_KEY', '')
    consumer_secret = os.getenv('MPESA_CONSUMER_SECRET', '')
    shortcode = os.getenv('MPESA_SHORTCODE', '174379')
    passkey = os.getenv('MPESA_PASSKEY', '')
    callback_url = os.getenv('MPESA_CALLBACK_URL', '')
    environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
    
    print("1. ENVIRONMENT VARIABLES CHECK:")
    print(f"   ├─ MPESA_CONSUMER_KEY: {'✓ Set' if consumer_key else '✗ Missing'} ({len(consumer_key)} chars)")
    print(f"   ├─ MPESA_CONSUMER_SECRET: {'✓ Set' if consumer_secret else '✗ Missing'} ({len(consumer_secret)} chars)")
    print(f"   ├─ MPESA_SHORTCODE: {shortcode}")
    print(f"   ├─ MPESA_PASSKEY: {'✓ Set' if passkey else '✗ Missing'} ({len(passkey)} chars)")
    print(f"   ├─ MPESA_CALLBACK_URL: {callback_url or '✗ Missing'}")
    print(f"   └─ MPESA_ENVIRONMENT: {environment}")
    print()
    
    if not consumer_key or not consumer_secret:
        print("✗ ERROR: MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set!")
        return False
    
    if not passkey:
        print("✗ ERROR: MPESA_PASSKEY must be set!")
        return False
    
    # Test authentication
    print("2. TESTING M-PESA AUTHENTICATION:")
    auth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    
    try:
        credentials = f"{consumer_key}:{consumer_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}'
        }
        
        print(f"   ├─ Auth URL: {auth_url}")
        print(f"   ├─ Sending request...")
        
        response = requests.get(auth_url, headers=headers, timeout=10)
        
        print(f"   ├─ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            access_token = result.get('access_token', '')
            print(f"   ├─ Access Token: ✓ Received ({len(access_token)} chars)")
            print(f"   └─ Expires In: {result.get('expires_in', 'N/A')} seconds")
            print()
            print("✓ Authentication successful!")
            return True, access_token
        else:
            print(f"   └─ Response: {response.text}")
            print()
            print("✗ Authentication failed!")
            
            # Common issues
            print("\nCommon Issues:")
            if response.status_code == 401:
                print("  • Invalid consumer key or secret")
                print("  • Check your credentials in Daraja portal")
            elif response.status_code == 403:
                print("  • App not authorized")
                print("  • Check if your app is approved in Daraja portal")
            elif response.status_code == 400:
                print("  • Bad request format")
                print("  • Ensure credentials are properly base64 encoded")
            
            return False, None
            
    except requests.exceptions.Timeout:
        print("   └─ Request timeout")
        print()
        print("✗ Network timeout - check your internet connection")
        return False, None
    except Exception as e:
        print(f"   └─ Error: {str(e)}")
        print()
        print(f"✗ Authentication error: {str(e)}")
        return False, None


def test_stk_push(access_token):
    """Test STK Push request format"""
    
    print()
    print("="*80)
    print("3. STK PUSH REQUEST TEST")
    print("="*80)
    print()
    
    shortcode = os.getenv('MPESA_SHORTCODE', '174379')
    passkey = os.getenv('MPESA_PASSKEY', '')
    callback_url = os.getenv('MPESA_CALLBACK_URL', '')
    
    # Generate password
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    data_to_encode = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(data_to_encode.encode()).decode()
    
    print(f"   ├─ Shortcode: {shortcode}")
    print(f"   ├─ Timestamp: {timestamp}")
    print(f"   ├─ Password: ✓ Generated")
    print(f"   └─ Callback URL: {callback_url}")
    print()
    
    # Test phone number
    test_phone = "254708374149"  # Safaricom test number
    
    payload = {
        'BusinessShortCode': shortcode,
        'Password': password,
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': 1,
        'PartyA': test_phone,
        'PartyB': shortcode,
        'PhoneNumber': test_phone,
        'CallBackURL': callback_url,
        'AccountReference': 'TEST123',
        'TransactionDesc': 'Test Payment'
    }
    
    print("   Payload:")
    for key, value in payload.items():
        if key == 'Password':
            print(f"     • {key}: [HIDDEN]")
        else:
            print(f"     • {key}: {value}")
    print()
    
    stk_push_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"   Sending STK Push to: {stk_push_url}")
    
    try:
        response = requests.post(
            stk_push_url,
            json=payload,
            headers=headers,
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        result = response.json()
        
        print()
        print("   Response:")
        for key, value in result.items():
            print(f"     • {key}: {value}")
        print()
        
        if result.get('ResponseCode') == '0':
            print("✓ STK Push successful!")
            return True
        else:
            print("✗ STK Push failed!")
            
            # Common issues
            print("\nCommon Issues:")
            error_msg = result.get('errorMessage', '')
            if 'Invalid Access Token' in error_msg:
                print("  • Access token expired or invalid")
            elif '401' in str(response.status_code):
                print("  • Invalid shortcode or credentials")
            elif '403' in str(response.status_code):
                print("  • Account not authorized for STK Push")
                print("  • Check if your shortcode is whitelisted")
            elif '400' in str(response.status_code):
                print("  • Invalid request format")
                print("  • Check password generation")
                print("  • Verify all required fields")
            
            return False
            
    except Exception as e:
        print(f"   Error: {str(e)}")
        print()
        print(f"✗ STK Push error: {str(e)}")
        return False


if __name__ == "__main__":
    print("\n" + "="*80)
    print("VOLAPLACE M-PESA INTEGRATION DEBUGGER")
    print("="*80)
    print()
    
    # Step 1: Test credentials
    auth_success, access_token = test_mpesa_credentials()
    
    if not auth_success:
        print("\n" + "="*80)
        print("RECOMMENDATION:")
        print("="*80)
        print("1. Verify your M-Pesa credentials in Render dashboard")
        print("2. Ensure you're using SANDBOX credentials (not production)")
        print("3. Check Daraja portal: https://developer.safaricom.co.ke")
        print("4. Make sure your app is approved/active")
        print("="*80)
        sys.exit(1)
    
    # Step 2: Test STK Push
    if access_token:
        stk_success = test_stk_push(access_token)
        
        if not stk_success:
            print("\n" + "="*80)
            print("RECOMMENDATION:")
            print("="*80)
            print("1. Check if shortcode 174379 is correct for sandbox")
            print("2. Verify passkey matches your shortcode")
            print("3. Ensure callback URL is publicly accessible")
            print("4. Test with Safaricom test phone: 254708374149")
            print("="*80)
            sys.exit(1)
    
    print("\n" + "="*80)
    print("✓ ALL TESTS PASSED!")
    print("="*80)
    print("Your M-Pesa integration is properly configured.")
    print("="*80)
    print()
