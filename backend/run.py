from dotenv import load_dotenv
from app import create_app

# Load environment variables from .env file
load_dotenv()

app = create_app()

if __name__ == '__main__':
    print("🚀 Starting VolaPlace Backend...")
    print("📡 Endpoints:")
    print("  http://localhost:5000/")
    print("  http://localhost:5000/api/health")
    print("  http://localhost:5000/api/shifts")
    print("  http://localhost:5000/api/payments/*")
    print("  http://localhost:5000/api/attendance/*")
    print("")
    app.run(debug=True, port=5000)

