# VolaPlace

Geo-verified volunteer marketplace

## Quick Deploy

Minimal boilerplate to get backend on Render and frontend on Vercel.

## Structure

```
volaplace/
├── backend/
│   ├── app/
│   │   └── __init__.py      # Flask app with CORS
│   ├── run.py               # App entry point
│   ├── requirements.txt     # Flask, gunicorn, flask-cors
│   └── Procfile            # For Render: web: gunicorn run:app
│
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main component
    │   └── index.jsx       # React entry
    ├── public/
    │   └── index.html
    └── package.json
```

## Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. New → Web Service
3. Connect your GitHub repo: `muhorocode/volaplace`
4. Settings:
   - **Name**: volaplace-api
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
5. Deploy
6. Copy your backend URL (e.g., `https://volaplace-api.onrender.com`)

## Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Add New → Project
3. Import `muhorocode/volaplace`
4. Settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
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
