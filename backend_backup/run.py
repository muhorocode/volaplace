#!/usr/bin/env python3
"""
Run VolaPlace Backend
"""
from app import create_app, db

app = create_app()

@app.route('/')
def index():
    return {
        'message': 'VolaPlace Backend is running!',
        'status': 'OK',
        'version': '1.0'
    }

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

# Initialize database
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created")
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == '__main__':
    print("")
    print("🚀 STARTING VOLAPLACE BACKEND")
    print("="*40)
    print("🌐 Server: http://localhost:5000")
    print("📡 Test endpoints:")
    print("   GET  /           - Server status")
    print("   GET  /health     - Health check")
    print("   GET  /api/status - API status")
    print("   GET  /api/test   - API test")
    print("")
    print("👤 Register user:")
    print('   curl -X POST http://localhost:5000/api/auth/register \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"email":"test@test.com","password":"test123","name":"Test","role":"volunteer"}\'')
    print("")
    print("Press CTRL+C to stop")
    print("="*40)
    print("")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
