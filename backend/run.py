from app import create_app

app = create_app()

if __name__ == '__main__':
    print("🚀 Starting VolaPlace Backend...")
    print("📡 Endpoints:")
    print("  http://localhost:5000/")
    print("  http://localhost:5000/api/health")
    print("  http://localhost:5000/api/auth/test")
    print("  ... and all /api/*/test endpoints")
    print("")
    app.run(debug=True, host='0.0.0.0', port=5000)
