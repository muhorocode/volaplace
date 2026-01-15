# 🌟 VolaPlace - Geo-Verified Volunteer Marketplace
**Phase 5 Capstone Project | Group 4**

[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black)](https://volaplace.vercel.app)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7)](https://volaplace-api.onrender.com)

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [The Problem We're Solving](#-the-problem-were-solving)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Recent Updates](#-recent-updates)
- [Getting Started](#-getting-started)
- [Deployment Guide](#-deployment-guide)

---

## 🎯 Project Overview

**VolaPlace** is a comprehensive geo-verified volunteer marketplace that connects organizations with volunteers through real-time geolocation, interactive maps, and integrated M-Pesa payments for seamless volunteer management and compensation.

### Core Stakeholders:
1. **🏢 Organizations** - Post volunteer opportunities, manage shifts, and fund volunteer payments
2. **👥 Volunteers** - Discover nearby opportunities, check-in with geolocation, and receive payments
3. **⚙️ Administrators** - Monitor platform activity, manage payout rules, and oversee operations

---

## 🚨 The Problem We're Solving

Community service faces critical challenges:
- **Fragmentation**: Organizations lack centralized volunteer management systems
- **Verification Issues**: No reliable way to confirm volunteers are physically on-site
- **Payment Delays**: Manual reimbursement processes are slow and error-prone
- **Discovery Gap**: Volunteers struggle to find relevant opportunities nearby
- **Impact Tracking**: Organizations can't easily measure beneficiary reach and outcomes

---

## 💡 Our Solution

VolaPlace addresses these challenges through:

### 🗺️ Geo-Spatial Search & Filtering
- **Interactive Map Interface**: Real-time visualization of all available volunteer shifts
- **Proximity-Based Sorting**: Haversine algorithm calculates distances and sorts shifts by proximity
- **Location-Aware Search**: Users can search based on their current GPS location or a custom address

### ✅ Geo-Verified Attendance
- **Geofence Technology**: Volunteers must be within 20 meters of shift locations to check-in
- **Dual Verification**: Both check-in and check-out are geo-verified for accuracy
- **Real-time Tracking**: Track volunteer attendance and location compliance

### 💰 M-Pesa Payment Integration
- **Organization Funding**: Organizations fund shifts via M-Pesa STK Push
- **Volunteer Payments**: Automated compensation upon shift completion
- **Transaction Tracking**: Complete payment history and reconciliation
- **Secure Processing**: Integrated with Safaricom Daraja API (sandbox for testing)

### 📊 Real-Time Impact Reporting
- Total volunteer hours tracked across the platform
- Shift completion and attendance monitoring
- Organization and volunteer performance metrics
- Comprehensive dashboard for administrators

---

## ✨ Key Features

### For Volunteers
- ✅ **Interactive Map Discovery** - Browse volunteer opportunities on Leaflet maps with real-time updates
- ✅ **Smart Filtering** - Filter shifts by distance, date, organization, and project
- ✅ **GPS Check-In/Out** - Geo-verified attendance within 20m geofenced areas
- ✅ **Complete Workflow Tracking** - Register → Check In → In Progress → Check Out → Pending Payment → Admin Approval → Completed
- ✅ **Persistent State Management** - Shift status survives page refresh and logout/login via localStorage
- ✅ **Personal Dashboard** - Track total earnings, hours worked, and beneficiaries served with real-time stats
- ✅ **Shift Status Tabs** - Available, In Progress, Pending Payment, and Completed tabs with accurate filtering
- ✅ **Mobile Optimized** - Fully responsive design with touch-friendly controls for on-the-go access

### For Organizations
- ✅ **Project Management** - Create projects with custom geofenced locations
- ✅ **Shift Creation** - Post volunteer shifts with hourly rates and bonus structures
- ✅ **M-Pesa Funding** - Fund shifts via STK Push with real-time confirmation
- ✅ **Demo Mode Backup** - Alternative funding when M-Pesa has service issues
- ✅ **Payment Approval System** - Review and approve volunteer payments after work completion
- ✅ **Budget Management** - Automatic budget deduction when approving payments
- ✅ **Volunteer Monitoring** - Track registrations, check-ins, and attendance in real-time
- ✅ **Payment Transparency** - View all funding and disbursement transactions
- ✅ **Dashboard Analytics** - Monitor active shifts, volunteer counts, and funding status

### For Administrators
- ✅ **Platform Overview** - System-wide analytics and activity monitoring
- ✅ **User Management** - Manage organizations, volunteers, and access permissions
- ✅ **Transaction Monitoring** - Complete audit trail of all M-Pesa and demo transactions
- ✅ **Payout Configuration** - Adjust platform-wide payment rules and rates
- ✅ **Comprehensive Reporting** - Export data for analysis and compliance

---

## 🔧 Recent Updates

### Volunteer Workflow with localStorage Persistence (January 2026) ✅
- **Complete Workflow**: Register → Check In → Check Out → Pending Payment → Admin Approval → Completed
- **localStorage Persistence**: Shift states persist across page refresh and logout/login
- **Admin Payment Approval**: Admins approve volunteer payments before marking as completed
- **Budget Deduction**: Organization budget automatically reduces when admin approves payments
- **Robust State Management**: Shifts remain in correct tabs (Available, In Progress, Pending Payment, Completed) even after refresh
- **Optimistic UI Updates**: Instant button state changes with no flickering
- **Enhanced Map**: Full-width interactive map with color-coded markers (RED=user location, GREEN=active shifts, BLUE=upcoming shifts)
- **Mobile Responsive**: Footer positioning fixed, improved mobile navigation and layout

### M-Pesa Payment Integration (January 2026) ✅
- ✅ **Live M-Pesa STK Push** - Organizations fund shifts via real M-Pesa payments
- ✅ **Real-time UI Updates** - Funded shifts instantly reflect in dashboard
- ✅ **Transaction Verification** - Callback handling validates and records payments
- ✅ **Demo Mode Backup** - Alternative funding method when M-Pesa services are unavailable
- ✅ **Complete Payment Flow** - From organization funding to volunteer payout fully functional
- ✅ **Funding Fields API** - All shift endpoints return `is_funded`, `funded_amount`, and `funding_transaction_id`

### UI/UX Enhancements (January 2026)
- ✅ **Mobile Responsive Design** - Optimized layouts for all screen sizes
- ✅ **Smooth Page Transitions** - Enhanced navigation with better user experience
- ✅ **Constant Footer Component** - Persistent footer across all pages
- ✅ **Improved Shift Manager** - Better funding UI with clear M-Pesa instructions
- ✅ **Real-time Funding Status** - Shifts show funding status and amounts instantly

### Code Quality & Performance
- ✅ Fixed `Shift.to_dict()` to include all funding fields
- ✅ Enhanced error handling and user feedback
- ✅ Optimized M-Pesa callback processing
- ✅ Improved geolocation validation and error messages
- ✅ Cleaned up debug logging for production readiness

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with hooks for state management |
| **Vite** | Fast build tool and development server |
| **React Router DOM** | Client-side routing and navigation |
| **Tailwind CSS v4** | Utility-first styling framework |
| **Leaflet** | Interactive map rendering |
| **Axios** | HTTP client for API communication |
| **Zustand** | Lightweight state management |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.10+** | Core programming language |
| **Flask** | Lightweight web framework |
| **PostgreSQL** | Relational database |
| **SQLAlchemy** | ORM for database interactions |
| **Flask-Migrate** | Database migration management |
| **Flask-JWT-Extended** | JWT authentication |
| **Flask-CORS** | Cross-origin resource sharing |
| **Gunicorn** | Production WSGI server |

### External Services
| Service | Purpose |
|---------|---------|
| **Safaricom Daraja API** | M-Pesa B2C payment processing |
| **Render** | Backend hosting and PostgreSQL database |
| **Vercel** | Frontend hosting with CDN |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                     │
│  React + Vite + Tailwind + Leaflet + React Router       │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS/JSON
                  │ JWT Authorization
┌─────────────────▼───────────────────────────────────────┐
│              Backend API (Render)                        │
│    Flask + SQLAlchemy + Flask-JWT-Extended              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes: Auth | Orgs | Shifts | Users | Search   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────┬───────────────────┘
                  │                  │
    ┌─────────────▼─────┐  ┌────────▼──────────┐
    │  PostgreSQL       │  │  M-Pesa Daraja    │
    │  (Database)       │  │  API (Payments)   │
    └───────────────────┘  └───────────────────┘
```

### Request Flow Example (Shift Check-In):
1. Volunteer clicks "Check-In" on mobile
2. Frontend captures GPS coordinates via `navigator.geolocation`
3. Request sent to `/api/attendance/checkin` with JWT + coordinates
4. Backend validates JWT and extracts user role
5. Haversine formula calculates distance to shift location
6. If distance ≤ 20m, check-in recorded in database
7. Success response sent to frontend
8. Map marker updates to show active attendance

---

## � Payment Flow & Process

VolaPlace implements a comprehensive payment system connecting organizations, volunteers, and M-Pesa for secure fund management.

### End-to-End Payment Journey

#### 1️⃣ **Organization Funds Shift**
Organizations fund volunteer shifts before volunteers can register:

**Via M-Pesa STK Push (Primary Method):**
- Organization clicks "Fund with M-Pesa" in their dashboard
- System validates minimum amount (KES 100)
- M-Pesa STK Push sent to organization's registered phone
- Organization enters M-Pesa PIN on their phone
- Backend receives callback from Safaricom Daraja API
- Shift marked as `is_funded=True` with transaction ID
- Dashboard updates in real-time showing funded status

**Via Demo Mode (Backup Method):**
- Available when M-Pesa services experience downtime or technical issues
- Instantly funds shift for testing and emergency scenarios
- Same database updates and UI behavior as real payments
- Transaction logged with type: "demo"

#### 2️⃣ **Volunteer Registration**
Once shift is funded:
- Shift appears as "Available" on volunteer map and list
- Volunteer clicks "Register" to join the shift
- `ShiftRoster` entry created linking volunteer to shift
- Status: `registered`, `checked_in=False`, `checked_out=False`

#### 3️⃣ **Geo-Verified Check-In**
On shift day, volunteer must be physically present:
- Volunteer navigates to "In Progress" tab
- Clicks "Check In" button
- System captures GPS coordinates
- Haversine algorithm validates volunteer is within 20m of shift location
- If valid: `checked_in=True`, `check_in_time` recorded, status saved to localStorage
- If outside geofence: Error message displayed
- Shift moves to "In Progress" tab and persists there even after page refresh

#### 4️⃣ **Work Completion & Check-Out**
After completing volunteer work:
- Volunteer clicks "Check Out" in "In Progress" tab
- Modal prompts for "Beneficiaries Served" count
- System calculates payment:
  ```
  Hours Worked = (Check-Out Time - Check-In Time)
  Base Payment = Hours × Hourly Rate (from shift)
  Bonus = Beneficiaries Served × Per-Beneficiary Rate (from shift)
  Total Payment = Base Payment + Bonus
  ```
- Shift moves to "Pending Payment" tab with `is_paid=false`
- Status saved to localStorage - persists across refresh/logout
- Volunteer sees "Payment Pending Admin Approval" message

#### 5️⃣ **Admin Payment Approval**
Organization admins review and approve payments:
- Admin views list of volunteers with pending payments
- Reviews work completion and beneficiaries served
- Clicks "Approve Payment" for each volunteer
- System:
  - Deducts payment from organization budget
  - Marks volunteer's roster entry as `is_paid=true`
  - Records transaction in payment history
- Volunteer's shift moves to "Completed" tab on next login/refresh
- Payment amount displayed in volunteer's history

#### 6️⃣ **Payment Records & Tracking**
All transactions logged in `TransactionLog` table:
- Organization funding transactions
- Volunteer payment disbursements
- Running balance of shift funds
- Complete audit trail for administrators

### Payment Security Features
- ✅ JWT authentication for all payment endpoints
- ✅ Role-based access control (only orgs can fund, only volunteers get paid)
- ✅ Geo-verification prevents payment fraud
- ✅ M-Pesa callback signature verification
- ✅ Transaction idempotency (duplicate prevention)
- ✅ Real-time balance validation before disbursement

### Supported Payment Scenarios
| Scenario | Handling |
|----------|----------|
| **Insufficient funds** | Payment blocked, volunteer notified to contact org |
| **M-Pesa timeout** | Callback processes async, status updates when received |
| **M-Pesa service down** | Demo mode available as backup |
| **Multiple volunteers** | Payments distributed proportionally from shift budget |
| **Early check-out** | Payment calculated based on actual hours worked |
| **No beneficiaries** | Base payment still processed (bonus = 0) |

---

## �🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Git** (with Git Flow workflow knowledge)

### Local Development Setup

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/muhorocode/volaplace.git
cd volaplace
```

#### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://username:password@localhost:5432/volaplace_db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
FLASK_ENV=development
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_business_shortcode
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-backend-url.onrender.com/api/payments/callback
EOF

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed database (optional - creates test data)
python seed.py

# Run development server
python run.py
```

Backend will run on `http://localhost:5000`

#### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 👥 User Roles & Access

### 🎫 How to Access Each Role

#### **Volunteer Account**
1. Visit the homepage
2. Click "Sign Up" in the navigation bar
3. Fill in the registration form:
   - Select role: **Volunteer**
   - Provide: Full Name, Email, Phone Number (M-Pesa format: 254XXXXXXXXX), Password
4. After registration, you'll be redirected to the Volunteer Dashboard
5. **Default credentials for testing:**
   - Email: `volunteer@test.com`
   - Password: `password123`

#### **Organization Account**
1. Click "Sign Up"
2. Select role: **Organization**
3. Provide: Organization Name, Admin Name, Email, Phone Number, Password
4. After registration, access the Organization Dashboard
5. **Default credentials for testing:**
   - Email: `org@test.com`
   - Password: `password123`

#### **Administrator Account**
⚠️ **Admin accounts are created manually for security reasons**

**Creating an Admin (Development):**
```bash
cd backend
python
>>> from app import create_app, db
>>> from app.models import User
>>> app = create_app()
>>> with app.app_context():
...     admin = User(
...         name='Admin User',
...         email='admin@volaplace.com',
...         phone_number='254700000000',
...         role='admin'
...     )
...     admin.set_password('SecureAdminPassword123!')
...     db.session.add(admin)
...     db.session.commit()
```

**Admin Login:**
- Email: `admin@volaplace.com`
- Password: `SecureAdminPassword123!`

**Admin Dashboard Access:**
Once logged in as admin, navigate to `/admin/dashboard` to access:
- Payout rules management
- Platform-wide analytics
- Organization oversight
- Payment reconciliation
- Impact reports

---

## 📚 API Documentation

### Base URL
- **Production**: `https://volaplace-api.onrender.com/api`
- **Development**: `http://localhost:5000/api`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate and receive JWT | No |
| POST | `/logout` | Invalidate current session | Yes |
| GET | `/me` | Get current user profile | Yes |

**Example: Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "254712345678",
  "password": "securepass123",
  "role": "volunteer"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "volunteer"
  }
}
```

#### 🏢 Organization Routes (`/api/organizations`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all organizations | Any |
| POST | `/` | Create new organization | org_admin |
| GET | `/:id` | Get organization details | Any |
| PUT | `/:id` | Update organization | org_admin |
| GET | `/:id/projects` | Get organization projects | Any |

#### 📅 Shift Routes (`/api/shifts`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all available shifts | Any |
| POST | `/` | Create new shift | org_admin |
| GET | `/:id` | Get shift details | Any |
| PUT | `/:id` | Update shift | org_admin |
| DELETE | `/:id` | Cancel shift | org_admin |
| POST | `/:id/signup` | Sign up for a shift | volunteer |
| GET | `/:id/roster` | View shift roster | org_admin |

**Example: Search Nearby Shifts**
```bash
GET /api/shifts?lat=-1.286389&lon=36.817223&radius=5000

Response: 200 OK
{
  "shifts": [
    {
      "id": 1,
      "title": "Community Cleanup",
      "organization": "Green Nairobi",
      "date": "2026-01-15",
      "start_time": "09:00",
      "end_time": "13:00",
      "location": {
        "latitude": -1.2921,
        "longitude": 36.8219
      },
      "distance_km": 1.2,
      "volunteers_needed": 10,
      "volunteers_signed_up": 3
    }
  ]
}
```

#### 📍 Attendance Routes (`/api/attendance`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/checkin` | Check-in to shift (geo-verified) | volunteer |
| POST | `/checkout` | Check-out from shift (geo-verified) | volunteer |
| GET | `/my-history` | View personal attendance history | volunteer |

**Example: Geo-Verified Check-In**
```bash
POST /api/attendance/checkin
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "shift_id": 1,
  "latitude": -1.286389,
  "longitude": 36.817223
}

Response: 200 OK (if within 20m)
{
  "message": "Check-in successful",
  "distance_meters": 15.3,
  "checked_in_at": "2026-01-15T09:05:23Z"
}

Response: 400 Bad Request (if too far)
{
  "error": "You are 156 meters away. Must be within 20 meters to check-in"
}
```

#### 💳 Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/callback` | M-Pesa callback handler (Daraja) | N/A (M-Pesa) |
| GET | `/history` | View payment history | volunteer |
| GET | `/status/:id` | Check payment status | volunteer/admin |

#### 🔍 Search Routes (`/api/search`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/shifts` | Geo-filtered shift search | No |
| GET | `/organizations` | Search organizations | No |

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │         │  Organizations   │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────┤ id (PK)          │
│ name            │  1:N    │ name             │
│ email (unique)  │         │ admin_id (FK)    │
│ phone_number    │         │ created_at       │
│ password_hash   │         └──────────────────┘
│ role (enum)     │                 │
│ created_at      │                 │ 1:N
└─────────────────┘                 │
        │                           ▼
        │ 1:N              ┌──────────────────┐
        │                  │  Projects        │
        │                  ├──────────────────┤
        │                  │ id (PK)          │
        │                  │ org_id (FK)      │
        │                  │ name             │
        │                  │ latitude         │
        │                  │ longitude        │
        │                  │ geofence_radius  │
        │                  └──────────────────┘
        │                           │
        │ 1:N                       │ 1:N
        │                           ▼
        │                  ┌──────────────────┐
        │                  │  Shifts          │
        │                  ├──────────────────┤
        │                  │ id (PK)          │
        │                  │ project_id (FK)  │
        │                  │ title            │
        │                  │ date             │
        │                  │ start_time       │
        │                  │ end_time         │
        │                  │ volunteers_needed│
        │                  └──────────────────┘
        │                           │
        │                           │ 1:N
        │                           ▼
        │                  ┌──────────────────┐
        └─────────────────►│  Attendance      │
                     1:N   ├──────────────────┤
                           │ id (PK)          │
                           │ shift_id (FK)    │
                           │ volunteer_id (FK)│
                           │ check_in_time    │
                           │ check_out_time   │
                           │ beneficiaries    │
                           │ payment_amount   │
                           │ payment_status   │
                           └──────────────────┘
```

### Key Tables

**users**
- Stores all platform users (volunteers, org_admins, admins)
- Password stored as bcrypt hash
- Phone number format validated for M-Pesa compatibility

**organizations**
- Represents NGOs and community organizations
- Links to admin user via foreign key

**projects**
- Physical locations where volunteer work happens
- Stores lat/lon coordinates and geofence radius (default 20m)

**shifts**
- Time-bound volunteer opportunities
- Links to project for location inheritance

**attendance**
- Records check-in/check-out with GPS coordinates
- Stores beneficiary count for payout calculation
- Tracks M-Pesa transaction status

---

## 🚀 Deployment Guide

Our project follows a professional CI/CD workflow using Git Flow and automated deployments.

### 📦 Production Deployment

#### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import `muhorocode/volaplace`

2. **Configure Build Settings**
   - Framework: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://volaplace-api.onrender.com/api
   ```

4. **Deploy**
   - Vercel auto-deploys on pushes to `main`
   - Preview deployments created for all branches

#### Backend Deployment (Render)

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - New → Web Service
   - Connect `muhorocode/volaplace`

2. **Configure Service**
   - Name: `volaplace-api`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn run:app`

3. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Name: `volaplace-db`
   - Copy Internal Database URL

4. **Environment Variables** (⚠️ Set in Render Dashboard)
   ```
   DATABASE_URL=<internal_database_url_from_render>
   JWT_SECRET_KEY=<generate_secure_random_key>
   FLASK_ENV=production
   MPESA_CONSUMER_KEY=<your_daraja_consumer_key>
   MPESA_CONSUMER_SECRET=<your_daraja_consumer_secret>
   MPESA_PASSKEY=<your_daraja_passkey>
   MPESA_SHORTCODE=<your_business_shortcode>
   MPESA_ENVIRONMENT=production
   MPESA_CALLBACK_URL=https://volaplace-api.onrender.com/api/payments/callback
   ```

5. **Deploy**
   - Render auto-deploys on pushes to `main`
   - Database migrations run automatically

### 🔐 M-Pesa Daraja API Setup

1. **Get Credentials**
   - Register at [Daraja Portal](https://developer.safaricom.co.ke)
   - Create an app
   - Note: Consumer Key, Consumer Secret, Passkey, Shortcode

2. **Configure Callback URL**
   - In Daraja Portal, set Callback URL to:
     `https://volaplace-api.onrender.com/api/payments/callback`

3. **Test in Sandbox**
   - Use sandbox credentials for development
   - Test phone: `254708374149`
   - Switch to production only after thorough testing

---

## 👨‍💻 Team & Workflow

### 📋 Our Team (Group 4)
This project was collaboratively built by Group 4 using industry-standard Git Flow methodology:

- **Team Lead**: Coordinated sprints, managed PR reviews, deployment oversight
- **Backend Engineers**: Flask API development, database design, M-Pesa integration
- **Frontend Engineers**: React components, map integration, responsive UI
- **Full-Stack Engineers**: End-to-end feature implementation, testing

### 🔄 Git Flow Workflow

We strictly followed Git Flow as mandated by the Technical Mentor:

```
main (production)
  │
  ├── release/v1.0 (final testing)
  │     │
develop (integration)
  │     │
  ├─────┼── feature/auth-system
  ├─────┼── feature/map-integration
  ├─────┼── feature/mpesa-payments
  └─────┴── feature/admin-dashboard
```

#### Branch Strategy
- **main**: Production-ready code only
- **develop**: Integration branch for completed features
- **feature/***: Individual feature branches (created from develop)
- **release/***: Pre-production testing and bug fixes

#### Pull Request Process
1. Create feature branch from `develop`
2. Implement feature with atomic commits
3. Push feature branch to remote
4. Open PR targeting `develop`
5. **Mandatory code review** by another team member
6. Merge only after approval
7. Delete feature branch

#### Example Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/shift-checkin

# Work and commit
git add .
git commit -m "feat: implement geo-verified check-in"
git push origin feature/shift-checkin

# Open PR on GitHub/GitLab
# After review and approval, merge via UI
# Feature is now in develop branch
```

### 📅 3-Week Development Timeline

**Week 1: Setup & Foundation**
- ✅ PostgreSQL schema designed (5 tables with relationships)
- ✅ Flask API configured with CORS and JWT
- ✅ Basic GET endpoints for shifts and organizations
- ✅ React routing and initial components
- ✅ Trello board set up for task management

**Week 2: Full Functionality**
- ✅ Complete CRUD operations for all models
- ✅ Haversine distance calculation implemented
- ✅ Geo-verified check-in/check-out logic
- ✅ Frontend-backend integration complete
- ✅ M-Pesa B2C payment flow implemented
- ✅ Consistent PR/code review process established

**Week 3: Polish & Delivery**
- ✅ Responsive UI with Tailwind CSS
- ✅ Map integration with Leaflet
- ✅ Admin dashboard and rules management
- ✅ Comprehensive testing and bug fixes
- ✅ Deployed to Vercel (frontend) and Render (backend)
- ✅ Final README and API documentation

---

## ✅ Project Completion Status

### Core Requirements (from TM Guide)

| Requirement | Status | Notes |
|------------|--------|-------|
| **React SPA with Client-Side Routing** | ✅ Complete | Using React Router DOM with role-based route guards |
| **Flask RESTful API** | ✅ Complete | 20+ endpoints, proper HTTP methods, JSON responses |
| **PostgreSQL with ≥3 Related Tables** | ✅ Complete | 5 tables: users, organizations, projects, shifts, attendance |
| **Git Flow (main, develop, feature/*)** | ✅ Complete | All merges via approved PRs, 50+ PRs merged |
| **Clean, Documented Code** | ✅ Complete | Docstrings, comments, README, API docs |
| **Deployed Application** | ✅ Complete | Frontend on Vercel, Backend on Render |

### MVP-Specific Requirements

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Three User Roles** | ✅ Complete | Volunteer, Organization, Admin with RBAC |
| **Organization Project Locations** | ✅ Complete | CRUD with lat/lon and geofence radius |
| **Volunteer Shifts Management** | ✅ Complete | Date, time, capacity, location inheritance |
| **Geo-Search with Map** | ✅ Complete | Leaflet map with real-time shift markers |
| **Distance-Based Sorting** | ✅ Complete | Haversine formula calculates proximity |
| **Shift Sign-Up** | ✅ Complete | One-click enrollment with roster tracking |
| **Geo-Verified Check-In/Out** | ✅ Complete | 20m geofence validation |
| **Beneficiary Input** | ✅ Complete | Captured at check-out for payout calculation |
| **Algorithmic M-Pesa Payout** | ✅ Complete | Formula: (Hourly Rate × Hours) + (Bonus × Beneficiaries) |
| **Admin Rules Management** | ✅ Complete | Global payout rules configuration |
| **Impact Audit Dashboard** | ✅ Complete | Total beneficiaries, disbursements, reconciliation |

### Advanced Features (Bonus)

| Feature | Status | Description |
|---------|--------|-------------|
| **Real-Time Location Updates** | ✅ Complete | GPS polling during active shifts |
| **Payment Status Webhooks** | ✅ Complete | M-Pesa callback handling |
| **Responsive Mobile Design** | ✅ Complete | Tailwind CSS mobile-first approach |
| **Search Filters** | ✅ Complete | Date range, organization, distance |
| **Profile Management** | ✅ Complete | Edit personal info, view stats |

---

## 📝 Testing the Application

### Quick Test Flow

1. **Register as a Volunteer**
   - Go to homepage → Sign Up
   - Select "Volunteer" role
   - Complete registration

2. **Browse Shifts on Map**
   - Allow location access
   - View available shifts as markers
   - Click markers for details

3. **Sign Up for a Shift**
   - Click "Sign Up" on shift card
   - View confirmation

4. **Simulate Check-In**
   - On shift day, navigate to the shift location
   - Click "Check-In"
   - System verifies you're within 20m

5. **Complete Shift & Get Paid**
   - After shift duration, click "Check-Out"
   - Enter number of beneficiaries served
   - Receive M-Pesa payment instantly

### Admin Testing

```bash
# Create admin user (backend)
cd backend
python
>>> from app import create_app, db
>>> from app.models import User
>>> app = create_app()
>>> with app.app_context():
...     admin = User(name='Test Admin', email='test@admin.com', 
...                  phone_number='254700000000', role='admin')
...     admin.set_password('admin123')
...     db.session.add(admin)
...     db.session.commit()

# Login and access /admin/dashboard
```

---

## 📞 Support & Contact

For questions or issues:
- **GitHub Issues**: [github.com/muhorocode/volaplace/issues](https://github.com/muhorocode/volaplace/issues)
- **Team Email**: group4@volaplace.com

---

## 🎯 Complete User Guide

### 🌐 Production Access

**Live URLs:**
- Frontend: https://volaplace.vercel.app
- Backend API: https://volaplace-api.onrender.com

### 🔑 Getting Started

**For Testing:** Run the seed script to create test accounts:
```bash
cd backend
flask db upgrade  # Initialize database
python seed.py    # Create test data
```

---

### 👥 Volunteer Guide

#### 1. Registration & Discovery

**Sign Up:**
1. Click "Sign Up" on homepage
2. Select role: "Volunteer"
3. Provide name, email, phone (format: 254XXXXXXXXX), password
4. Redirected to volunteer dashboard

**Discover Opportunities:**
- **Map View**: See available shifts as colored markers
- **Location-Based**: Allow GPS access for proximity sorting
- **Shift Cards**: View details (date, time, distance, organization)

#### 2. Enrolling in Shifts

1. Browse available shifts on map or dashboard
2. Click "Sign Up" on desired shift
3. View enrolled shifts in "My Shifts" tab

#### 3. Geo-Verified Check-In

**Requirements:**
- Must be within 20 meters of shift location
- Current date matches shift date
- Time within shift window

**Process:**
1. Navigate to Check-In page from "My Shifts"
2. Allow location access when prompted
3. Map shows:
   - Blue circle = 20m geofence
   - Red marker = Your location
   - Distance indicator
4. If within 20m, "Check In" button activates
5. Click to confirm attendance

**Example:**
```
✅ "You are 15 meters from location" → Check-in enabled
❌ "You are 156 meters away" → Move closer
```

#### 4. Check-Out & Payment

**Process:**
1. Complete volunteer work
2. Check-out button enables near shift end time
3. Must still be within 20m radius
4. Enter beneficiaries served (number of people helped)
5. System calculates payment:
   ```
   Stipend = (Hourly Rate × Hours) + (Bonus × Beneficiaries)
   Example: (150 KES × 4 hrs) + (12 KES × 25 people) = 900 KES
   ```
6. M-Pesa payment sent automatically to registered phone
7. Approve STK Push on phone to receive funds

**Dashboard Features:**
- View upcoming shifts
- Track completed shifts
- See payment history
- Personal stats (hours, beneficiaries, earnings)

---

### 🏢 Organization Guide

#### 1. Organization Setup

**Registration:**
1. Click "Sign Up"
2. Select role: "Organization"
3. Provide organization name, admin details, credentials
4. Access organization dashboard

#### 2. Creating Project Locations

**What is a Project?**
A physical location where volunteer work happens with GPS coordinates and geofence.

**Steps:**
1. Click "Create New Project"
2. Enter project name and address
3. Set location:
   - **Option A**: Click on map to place marker
   - **Option B**: Enter coordinates manually
4. Set geofence radius (default: 20 meters)
5. Submit to create

#### 3. Creating Volunteer Shifts

**Steps:**
1. Click "Create New Shift"
2. Select project location (dropdown)
3. Fill shift details:
   - Title and description
   - Date and time (start/end)
   - Number of volunteers needed
4. Submit - shift goes live immediately
5. Volunteers can now see and sign up

#### 4. Managing Operations

**Shift Roster:**
- View all volunteers signed up
- Real-time check-in status
- Green checkmark = Checked in
- Yellow clock = Signed up, not checked in
- Track attendance and completion

**Dashboard Tabs:**
- **Projects**: Manage all project locations
- **Shifts**: View upcoming, active, and completed
- **Volunteers**: See volunteer history and contacts

**Statistics:**
- Active projects count
- Upcoming shifts
- Total volunteers engaged
- Completed shifts

---

### ⚙️ Admin Guide

#### 1. Admin Access

Admin accounts manage platform-wide settings and monitoring.

**Login:** Use admin credentials created via seed script or manual setup.

**Dashboard Access:** Automatically redirected to `/admin/dashboard`

#### 2. Platform Statistics

**Real-Time Metrics:**
- Total Beneficiaries Served
- Total Paid Out (KES)
- Pending Payouts (KES)
- Active Volunteers
- Organizations registered
- Project Locations
- Active Shifts

#### 3. Global Payout Rules

**Understanding the Formula:**
```
Stipend = (Base Hourly Rate × Hours Worked) + (Bonus per Beneficiary × Beneficiaries Served)
```

**Managing Rules:**
1. View current rates in dashboard
2. Click "Edit Rules"
3. Update values:
   - Base Hourly Rate (KES)
   - Bonus per Beneficiary (KES)
4. Preview calculation shows impact
5. Save changes - applies to all future payments

**Example:**
```
Current: 150 KES/hour + 12 KES/beneficiary
Updated: 200 KES/hour + 15 KES/beneficiary
Impact: 4-hour shift with 20 beneficiaries = 1,100 KES (vs. 840 KES)
```

#### 4. Payment Reconciliation

**Transaction Log:**
View all M-Pesa transactions with:
- Volunteer name
- Phone number
- Amount
- Status (completed/pending/failed)

**Status Indicators:**
- **✅ Completed**: Payment successful
- **⏳ Pending**: Awaiting confirmation
- **❌ Failed**: Requires attention

**Troubleshooting Failed Payments:**
- Verify phone number format (254XXXXXXXXX)
- Check M-Pesa credentials in environment variables
- Review Render logs for errors
- Retry manually if needed

#### 5. Platform Monitoring

**Organization Oversight:**
- View all registered organizations
- Monitor organization activity
- Track shifts created per org
- Review volunteer engagement

**Impact Reports:**
Generate summaries of:
- Total platform beneficiaries
- Total volunteer hours
- Total disbursements
- Organization performance metrics

---

### ✅ Testing Checklist

**Volunteer Flow:**
- [ ] Register and login
- [ ] Browse shifts on map
- [ ] Sign up for shift
- [ ] Check-in with location verification
- [ ] Check-out and enter beneficiaries
- [ ] Receive M-Pesa payment

**Organization Flow:**
- [ ] Register organization
- [ ] Create project location
- [ ] Create volunteer shift
- [ ] View volunteer roster
- [ ] Monitor check-in status

**Admin Flow:**
- [ ] Access admin dashboard
- [ ] View platform statistics
- [ ] Update payout rules
- [ ] Review transaction log
- [ ] Monitor organizations

---

### 🐛 Troubleshooting

**Location Permission Issues:**
- Check browser settings for location access
- Allow location for volaplace domain
- Refresh page after granting permission

**"Too Far from Location" Error:**
- Must be within 20 meters of shift location
- Verify correct shift location on map
- Move closer to the geofence circle

**Shift Not Appearing:**
- Verify shift date is current or future
- Check available spots remaining
- Confirm project has valid coordinates
- Refresh page to reload data

**M-Pesa Payment Issues:**
- Verify phone number format (254XXXXXXXXX)
- Check Render environment variables
- Review backend logs for errors
- Confirm M-Pesa account has sufficient balance

---

### 📱 Mobile Usage

**Best Experience:**
- Use actual mobile device for GPS accuracy
- Native M-Pesa app for payments
- Portrait mode optimized
- Touch-friendly interface

**Desktop Testing:**
- Chrome DevTools → Sensors → Override geolocation
- Use coordinates from seed data for testing
- Mobile view in browser (F12 → Device toolbar)

---

## 📄 License

This project is developed as part of the Phase 5 Capstone Project for educational purposes.

---

**Built with ❤️ by Group 4 | January 2026**
   - **Output Directory**: `build`
5. Environment Variables:
   - `REACT_APP_API_URL` = your Render backend URL
6. Deploy

## Local Development

**Backend**:
```bash
cd backend
pip install -r requirements.txt
python run.py
# Runs on http://localhost:5000
```

**Frontend**:
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## Team

**Project Board**: https://github.com/users/muhorocode/projects/4/views/2
