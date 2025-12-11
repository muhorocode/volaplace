#!/bin/bash
echo "=== COMPREHENSIVE VOLAPLACE TEST ==="
echo

echo "1. Cleaning up..."
rm -f cookies.txt org_cookies.txt shift_cookies.txt

echo "2. Register a volunteer..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"vol@test.com","password":"vol123","name":"Vol Test","role":"volunteer"}' | python3 -m json.tool
echo

echo "3. Login and save cookies..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vol@test.com","password":"vol123"}' \
  -c cookies.txt | python3 -m json.tool
echo

echo "4. Check auth with cookies..."
curl -s -X GET http://localhost:5000/api/auth/check \
  -H "Content-Type: application/json" \
  -b cookies.txt | python3 -m json.tool
echo

echo "5. List all users..."
curl -s http://localhost:5000/api/users/ | python3 -m json.tool
echo

echo "6. Register an organization..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"org2@test.com","password":"org123","name":"Org Two","role":"organization"}' | python3 -m json.tool
echo

echo "7. Login as organization..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"org2@test.com","password":"org123"}' \
  -c org_cookies.txt | python3 -m json.tool
echo

echo "8. Create organization profile..."
curl -s -X POST http://localhost:5000/api/organizations/ \
  -H "Content-Type: application/json" \
  -b org_cookies.txt \
  -d '{"description":"Second test org","address":"456 Org Ave","website":"https://org2.test"}' | python3 -m json.tool
echo

echo "9. List organizations..."
curl -s http://localhost:5000/api/organizations/ | python3 -m json.tool
echo

echo "10. Create a shift..."
curl -s -X POST http://localhost:5000/api/shifts/ \
  -H "Content-Type: application/json" \
  -b org_cookies.txt \
  -d '{"title":"Beach Cleanup","description":"Help clean the beach","address":"Santa Monica Beach","latitude":34.0078,"longitude":-118.4999,"start_time":"2024-12-15T10:00:00","end_time":"2024-12-15T13:00:00","volunteers_needed":20}' | python3 -m json.tool
echo

echo "11. List shifts..."
curl -s http://localhost:5000/api/shifts/ | python3 -m json.tool
echo

echo "✅ ALL TESTS COMPLETE!"
