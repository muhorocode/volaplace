# API Testing Guide

## Option 1: Automated Tests (Recommended for Development)

### Run all tests:
```bash
cd backend
python test_auth.py
```

**Benefits:**
- Fast (runs in seconds)
- Consistent results
- Can run before every commit
- Great for CI/CD

---

## Option 2: Postman (Recommended for Manual Testing)

### Setup:
1. Install Postman: https://www.postman.com/downloads/
2. Import collection: `VolaPlace_API.postman_collection.json`
3. Make sure server is running: `python run.py`

### How to Import:
1. Open Postman
2. Click "Import" button (top left)
3. Select `VolaPlace_API.postman_collection.json`
4. Collection will appear in sidebar

### Testing Flow:
1. **Register** - Create a new user
2. **Login** - Get JWT token (automatically saved)
3. **Get Current User** - Test protected endpoint with token

### Variables:
- `base_url`: http://localhost:5000 (change for production)
- `access_token`: Auto-populated after login

---

## Option 3: cURL (Quick Terminal Testing)

### Test Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "phone": "254712345678",
    "role": "volunteer",
    "name": "Test User"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test Protected Endpoint:
```bash
TOKEN="your_token_here"
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Best Practice: Use Both!

### During Development:
1. **Write code** → Run `test_auth.py` to verify
2. **Manual testing** → Use Postman to explore
3. **Before commit** → Run all tests
4. **Debug issues** → Use Postman to inspect

### Before Pull Request:
```bash
# Run all tests
python test_auth.py

# If all pass, commit and push
git add .
git commit -m "test: verify authentication endpoints"
git push
```

---

## Testing Checklist for Your Code

### ✅ Authentication Endpoints:
- [x] POST `/api/auth/register` - User registration
- [x] POST `/api/auth/login` - User login with JWT
- [x] GET `/api/auth/me` - Get current user (protected)
- [ ] POST `/api/auth/logout` - Logout (TODO)
- [ ] PUT `/api/auth/profile` - Update profile (TODO)

### 📝 Other Endpoints (To be implemented):
- [ ] Organizations CRUD
- [ ] Shifts CRUD
- [ ] Applications
- [ ] Payments
- [ ] Attendance

---

## When to Use What:

| Scenario | Tool | Why |
|----------|------|-----|
| Quick smoke test | test_auth.py | Fast, automated |
| Debugging specific issue | Postman | Visual, interactive |
| Exploring API | Postman | Easy to modify requests |
| Before commit | test_auth.py | Catch regressions |
| Sharing with team | Postman collection | Everyone uses same tests |
| CI/CD pipeline | pytest/unittest | Automated |
| Quick terminal test | cURL | No extra tools needed |

