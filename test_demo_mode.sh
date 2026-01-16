#!/bin/bash

# VolaPlace Demo Mode Quick Test Script
# This script helps you quickly test the demo funding mode

echo "🧪 VolaPlace Demo Mode Test"
echo "=============================="
echo ""

# Get backend URL
API_URL=${VITE_API_URL:-"http://localhost:5000"}
echo "📡 API URL: $API_URL"
echo ""

# Test 1: Check if demo endpoint exists
echo "Test 1: Checking demo endpoint availability..."
DEMO_ENDPOINT="$API_URL/api/payments/fund-shift-demo"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $DEMO_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Demo endpoint is available (returned $HTTP_CODE - expected without auth)"
else
  echo "❌ Demo endpoint issue (HTTP $HTTP_CODE)"
  echo "   Make sure backend is running on $API_URL"
fi
echo ""

# Test 2: Verify backend is running
echo "Test 2: Checking if backend is running..."
HEALTH_CHECK=$(curl -s "$API_URL/api/shifts" 2>/dev/null | grep -o "error\|success\|{")
if [ ! -z "$HEALTH_CHECK" ]; then
  echo "✅ Backend is responding"
else
  echo "❌ Backend not responding. Start it with:"
  echo "   cd backend && python run.py"
fi
echo ""

# Test 3: Check frontend
echo "Test 3: Checking if frontend is accessible..."
FRONTEND_URL="http://localhost:5173"
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$FRONTEND_CHECK" = "200" ]; then
  echo "✅ Frontend is running on $FRONTEND_URL"
else
  echo "❌ Frontend not accessible. Start it with:"
  echo "   cd frontend && npm run dev"
fi
echo ""

echo "=============================="
echo "🎯 Quick Test Steps:"
echo ""
echo "1. Login as Organization Admin"
echo "   - Go to: $FRONTEND_URL"
echo "   - Use any org admin account"
echo ""
echo "2. Create/View a Shift"
echo "   - Navigate to: Org Dashboard > Manage Shifts"
echo ""
echo "3. Fund with Demo Mode"
echo "   - Click 'Fund Shift' button"
echo "   - Enter amount: 5000"
echo "   - Click '🧪 Fund with Demo Mode' (yellow button)"
echo ""
echo "4. Verify Funding"
echo "   - Should see: 'Shift funded successfully (Demo Mode)'"
echo "   - Shift should show: 'Funded: KES 5000'"
echo ""
echo "✅ If all tests pass, demo mode is ready!"
echo "📖 See TESTING_GUIDE.md for full testing instructions"
echo ""
