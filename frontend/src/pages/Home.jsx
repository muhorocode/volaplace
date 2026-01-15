import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SearchMap from "../components/Maps/SearchMap";
import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedShift, setSelectedShift] = useState(null);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">VolaPlace</h1>
            <div className="space-x-2 sm:space-x-4">
              <button 
                onClick={() => openAuthModal('login')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-white/10 transition"
              >
                Login
              </button>
              <button 
                onClick={() => openAuthModal('register')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Hero Content */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Find Volunteer Opportunities Near You</h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-4 sm:mb-6 max-w-2xl mx-auto">
            Connect with organizations, track your impact, and get rewarded for making a difference.
          </p>
          {locationError && (
            <p className="text-yellow-200 text-sm">{locationError}</p>
          )}
        </div>
      </section>

      {/* Map Section - Full Width */}
      <section className="w-full mb-8">
        <div className="bg-white shadow-lg overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 border-b bg-gray-50">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">Available Shifts Near You</h3>
            <p className="text-xs sm:text-sm text-gray-500">Click on a marker to see shift details</p>
          </div>
          <div className="h-[500px] sm:h-[600px] w-full">
            <SearchMap 
              userLocation={userLocation}
              onShiftSelect={(shift) => {
                setSelectedShift(shift);
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
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
      <section className="bg-slate-800 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Make an Impact?</h2>
          <p className="text-sm sm:text-base text-slate-300 mb-4 sm:mb-6">Join thousands of volunteers and organizations on VolaPlace.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:space-x-4 justify-center">
            <button 
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Get Started as Volunteer
            </button>
            <button 
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-white rounded-lg font-medium hover:bg-white/10 transition"
            >
              Register Organization
            </button>
          </div>
        </div>
      </section>

      </div> {/* Close Main Content Wrapper */}

      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Shift Details Modal */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedShift.title}</h2>
                <button
                  onClick={() => setSelectedShift(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-600">{selectedShift.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Date</h3>
                    <p className="text-gray-600">
                      📅 {selectedShift.date ? new Date(selectedShift.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Time</h3>
                    <p className="text-gray-600">⏰ {selectedShift.start_time} - {selectedShift.end_time}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Location</h3>
                    <p className="text-gray-600">📍 {selectedShift.project?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Volunteers Needed</h3>
                    <p className="text-gray-600">👥 {selectedShift.max_volunteers || 0}</p>
                  </div>
                  {selectedShift.distance_km && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Distance</h3>
                      <p className="text-gray-600">🚶 {selectedShift.distance_km.toFixed(1)} km away</p>
                    </div>
                  )}
                  {selectedShift.is_funded && selectedShift.funded_amount && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Funded</h3>
                      <p className="text-green-600 font-semibold">✓ KES {selectedShift.funded_amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <button
                    onClick={() => {
                      setSelectedShift(null);
                      openAuthModal('signup');
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Sign Up to Register for this Shift
                  </button>
                  <button
                    onClick={() => {
                      setSelectedShift(null);
                      openAuthModal('login');
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Already have an account? Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

