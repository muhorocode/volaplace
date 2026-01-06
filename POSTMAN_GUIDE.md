# VolaPlace API - Postman Testing Guide

## Quick Setup

1. **Import Collection**
   - Open Postman
   - Click "Import" → Select `VolaPlace_API.postman_collection.json`

2. **Set Environment Variable**
   - Click "Environments" (left sidebar)
   - Create new environment: "VolaPlace Local"
   - Add variable:
     - `base_url` = `http://localhost:5000`

3. **Test Flow**

### Step 1: Register User
- Request: **1. Register User**
- Creates new account
- Returns user info

### Step 2: Login
- Request: **2. Login User**  
- Returns JWT token (auto-saved to `{{token}}`)
- Token expires in 24 hours

### Step 3: Get Profile
- Request: **3. Get Current User**
- Uses token automatically
- Shows your profile info

## Tips

- Token auto-saves after login
- Change email in register to test multiple users
- Wrong password = 401 error (expected)
- No token = 401 error (expected)
