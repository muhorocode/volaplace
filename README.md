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
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [User Roles & Access](#-user-roles--access)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment Guide](#-deployment-guide)
- [Team & Workflow](#-team--workflow)

---

## 🎯 Project Overview

**VolaPlace** is a comprehensive geo-verified volunteer marketplace that connects three key stakeholders in the community service ecosystem:

1. **🏢 Organizations** - Post volunteer opportunities and manage shifts
2. **👥 Volunteers** - Discover nearby opportunities, check-in on-site, and earn rewards
3. **⚙️ Administrators** - Monitor platform activity, manage payout rules, and generate impact reports

Our platform leverages **real-time geolocation**, **interactive maps**, and **automated M-Pesa payments** to create a transparent, efficient volunteer management system.

---

## 🚨 The Problem We're Solving

Community service faces critical challenges:

- **Fragmentation**: Organizations lack a centralized platform to manage volunteer activities
- **Verification Issues**: No reliable way to confirm volunteers are physically on-site
- **Payment Delays**: Manual reimbursement processes are slow and error-prone
- **Discovery Gap**: Volunteers struggle to find relevant opportunities near them
- **Impact Tracking**: Organizations can't easily measure beneficiary reach and outcomes

---

## 💡 Our Solution

VolaPlace addresses these challenges through:

### 🗺️ Geo-Spatial Search & Filtering
- **Interactive Map Interface**: Real-time visualization of all available volunteer shifts
- **Proximity-Based Sorting**: Haversine algorithm calculates distances and sorts shifts by proximity
- **Location-Aware Search**: Users can search based on their current GPS location or a custom address

### ✅ Geo-Verified Attendance
- **Geofence Technology**: Volunteers must be within 20 meters of the shift location to check-in
- **Dual Verification**: Both check-in and check-out are geo-verified for accuracy
- **Beneficiary Tracking**: Volunteers log the number of people served during their shift

### 💰 Algorithmic Automated Payments
Our platform calculates stipends using a transparent formula:

```
Stipend = (Base Hourly Rate × Hours Worked) + (Bonus per Beneficiary × Beneficiaries Served)
```

Payments are instantly disbursed via **M-Pesa B2C API** upon successful check-out.

### 📊 Real-Time Impact Reporting
- Total volunteer hours tracked
- Beneficiaries served aggregated across all shifts
- Payment reconciliation dashboard
- Organization performance metrics

---

## ✨ Key Features

### For Volunteers
- ✅ Browse volunteer opportunities on an interactive map
- ✅ Filter shifts by distance, date, and organization
- ✅ Sign up for shifts with one click
- ✅ GPS-verified check-in/check-out
- ✅ Automatic M-Pesa payment upon shift completion
- ✅ View shift history and total earnings
- ✅ Track personal impact (hours, beneficiaries served)

### For Organizations
- ✅ Create and manage project locations with geofence radii
- ✅ Post volunteer shifts with requirements and schedules
- ✅ View volunteer roster in real-time
- ✅ Monitor check-in/check-out status
- ✅ Access shift completion reports
- ✅ Configure payout parameters

### For Administrators
- ✅ Manage global payout rules (hourly rates, bonuses)
- ✅ Audit all platform transactions
- ✅ View comprehensive impact reports
- ✅ Manage organizations and project locations
- ✅ Reconcile M-Pesa payment statuses
- ✅ Platform-wide analytics dashboard

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

## 🚀 Getting Started

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
