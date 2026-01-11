"""
Debug M-Pesa Credentials
"""
import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

consumer_key = os.getenv('MPESA_CONSUMER_KEY', '')
consumer_secret = os.getenv('MPESA_CONSUMER_SECRET', '')

print("="*60)
print("🔍 M-PESA CREDENTIAL DEBUG")
print("="*60)
print(f"Consumer Key Length: {len(consumer_key)}")
print(f"Consumer Key: {consumer_key[:10]}...{consumer_key[-10:]}")
print(f"Consumer Secret Length: {len(consumer_secret)}")
print(f"Consumer Secret: {consumer_secret[:10]}...{consumer_secret[-10:]}")
print()

# Test encoding
credentials = f"{consumer_key}:{consumer_secret}"
print(f"Combined Length: {len(credentials)}")
encoded = base64.b64encode(credentials.encode()).decode()
print(f"Encoded Length: {len(encoded)}")
print(f"Encoded: {encoded[:20]}...{encoded[-20:]}")
print()

# Test request
auth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
headers = {
    'Authorization': f'Basic {encoded}'
}

print("="*60)
print("Testing Authentication Request...")
print("="*60)
print(f"URL: {auth_url}")
print(f"Headers: {headers}")
print()

try:
    response = requests.get(auth_url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ SUCCESS!")
        data = response.json()
        print(f"Access Token: {data.get('access_token', 'N/A')[:20]}...")
    else:
        print(f"\n❌ FAILED with status {response.status_code}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
