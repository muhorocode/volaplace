"""
Quick test script for M-Pesa STK Push
"""
import sys
sys.path.append('/home/elicode/Development/code/phase-5/volaplace/backend')

from utils.mpesa import mpesa
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

print("=" * 60)
print("🧪 M-PESA STK PUSH TEST")
print("=" * 60)

# Check if credentials are loaded
consumer_key = os.getenv('MPESA_CONSUMER_KEY')
consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
shortcode = os.getenv('MPESA_SHORTCODE')

print(f"\n✅ Consumer Key: {consumer_key[:10]}..." if consumer_key else "❌ Consumer Key: NOT FOUND")
print(f"✅ Consumer Secret: {consumer_secret[:10]}..." if consumer_secret else "❌ Consumer Secret: NOT FOUND")
print(f"✅ Shortcode: {shortcode}" if shortcode else "❌ Shortcode: NOT FOUND")

if not all([consumer_key, consumer_secret, shortcode]):
    print("\n❌ ERROR: M-Pesa credentials not found in .env file!")
    sys.exit(1)

print("\n" + "=" * 60)
print("STEP 1: Testing M-Pesa Authentication")
print("=" * 60)

# Test getting access token
access_token = mpesa.get_access_token()

if access_token:
    print(f"✅ SUCCESS! Access token obtained: {access_token[:20]}...")
else:
    print("❌ FAILED to get access token")
    sys.exit(1)

print("\n" + "=" * 60)
print("STEP 2: Initiating STK Push")
print("=" * 60)

# Test phone number (Safaricom test number for sandbox)
test_phone = "254708374149"  # This is a test number that works in sandbox
amount = 10  # Small test amount

print(f"📱 Phone: {test_phone}")
print(f"💰 Amount: KES {amount}")
print(f"📝 Reference: TEST-PAYMENT-001")
print("\nSending STK Push request...")

result = mpesa.stk_push(
    phone_number=test_phone,
    amount=amount,
    account_reference="TEST-PAYMENT-001",
    transaction_desc="Test payment from VolaPlace"
)

print("\n" + "=" * 60)
print("RESULT:")
print("=" * 60)

if result.get('success'):
    print("✅ STK PUSH SENT SUCCESSFULLY!")
    print(f"\n📋 Checkout Request ID: {result.get('checkout_request_id')}")
    print(f"📋 Merchant Request ID: {result.get('merchant_request_id')}")
    print(f"💬 Message: {result.get('message')}")
    print("\n⚠️  Note: Check phone {test_phone} for M-Pesa prompt")
    print("    (In sandbox, you may not receive actual SMS)")
else:
    print("❌ STK PUSH FAILED!")
    print(f"Error: {result.get('error')}")

print("\n" + "=" * 60)
