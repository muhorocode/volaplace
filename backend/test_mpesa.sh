#!/bin/bash
# M-Pesa STK Push Testing Script

echo "💰 Testing M-Pesa STK Push Integration"
echo "========================================"
echo ""

# Get admin token first
echo "📝 Step 1: Login as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@volaplace.com",
    "password": "Admin123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Make sure backend is running and admin exists."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Calculate payment for Mary (who worked shift 2 and hasn't been paid)
echo "📊 Step 2: Calculate payment for completed shift..."
CALC_RESPONSE=$(curl -s -X POST http://localhost:5000/api/payments/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "shift_roster_id": 2
  }')

echo "Calculation result:"
echo $CALC_RESPONSE | python3 -m json.tool
echo ""

# Get volunteer phone number
VOLUNTEER_PHONE="254711000002"  # Mary's phone from seed data

# Initiate M-Pesa payment
echo "📱 Step 3: Initiating M-Pesa STK Push..."
MPESA_RESPONSE=$(curl -s -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"shift_roster_id\": 2,
    \"phone\": \"$VOLUNTEER_PHONE\"
  }")

echo "M-Pesa Response:"
echo $MPESA_RESPONSE | python3 -m json.tool
echo ""

# Check transaction status
echo "🔍 Step 4: Checking transaction status..."
sleep 2
TRANSACTIONS=$(curl -s -X GET http://localhost:5000/api/payments/transactions \
  -H "Authorization: Bearer $TOKEN")

echo "Recent transactions:"
echo $TRANSACTIONS | python3 -m json.tool
echo ""

echo "========================================="
echo "✅ Test completed!"
echo ""
echo "📝 Notes:"
echo "- Sandbox mode: Real STK Push won't appear on phone"
echo "- Check backend logs for Safaricom API responses"
echo "- Transaction will be in 'pending' until callback received"
echo ""
echo "🧪 To test with real M-Pesa:"
echo "1. Get production credentials from Safaricom"
echo "2. Update MPESA_ENVIRONMENT=production in .env"
echo "3. Use a real Kenyan phone number"
