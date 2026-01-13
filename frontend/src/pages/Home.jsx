import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SearchMap from "../components/Maps/SearchMap";
import AuthModal from "../components/AuthModal";
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'org_admin') {
        navigate('/org/dashboard');
      } else {
        navigate('/volunteer/shifts');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // Try to get user's location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError("Location access denied. Showing Nairobi area.");
        }
      );
    }
  }, []);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">VolaPlace</h1>
            <div className="space-x-4">
              <button 
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Login
              </button>
              <button 
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Find Volunteer Opportunities Near You</h2>
          <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
            Connect with organizations, track your impact, and get rewarded for making a difference.
          </p>
          {locationError && (
            <p className="text-yellow-200 text-sm">{locationError}</p>
          )}
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">Available Shifts Near You</h3>
            <p className="text-sm text-gray-500">Click on a marker to see shift details</p>
          </div>
          <div className="h-[500px]">
            <SearchMap 
              userLocation={userLocation}
              onShiftSelect={(shift) => {
                toast(`To sign up for "${shift.title}", please login or register.`, {
                  icon: '📋',
                  duration: 4000
                });
                openAuthModal('login');
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Find Nearby Shifts</h3>
            <p className="text-gray-600">Discover volunteer opportunities sorted by distance from your location.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">GPS Check-In</h3>
            <p className="text-gray-600">Verify your attendance automatically with geofenced check-in/check-out.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Payments</h3>
            <p className="text-gray-600">Receive your stipend directly via M-Pesa after completing shifts.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-slate-300 mb-6">Join thousands of volunteers and organizations on VolaPlace.</p>
          <div className="space-x-4">
            <button 
              onClick={() => openAuthModal('register')}
              className="inline-block px-6 py-3 bg-orange-600 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Get Started as Volunteer
            </button>
            <button 
              onClick={() => openAuthModal('register')}
              className="inline-block px-6 py-3 border border-white rounded-lg font-medium hover:bg-white/10 transition"
            >
              Register Organization
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 VolaPlace. Built with ❤️ for community service.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}

