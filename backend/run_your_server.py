#!/usr/bin/env python3
"""
Run YOUR VolaPlace Backend
"""
from app import create_app, db

app = create_app()

@app.route('/')
def index():
    return {
        'message': 'VolaPlace Backend (YOUR CODE) is running!',
        'status': 'OK'
    }

@app.route('/test')
def test():
    return {'test': 'passed'}, 200

# Initialize database
with app.app_context():
    db.create_all()
    print("✅ Database initialized")

if __name__ == '__main__':
    print("🚀 STARTING YOUR ACTUAL BACKEND CODE")
    print("🌐 Server: http://localhost:5000")
    print("📡 Test with: curl http://localhost:5000/")
    print("")
    app.run(debug=True, host='0.0.0.0', port=5000)
