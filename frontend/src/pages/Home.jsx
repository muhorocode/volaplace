import React, { useState, useEffect } from 'react';
import SearchMap from '../components/Maps/SearchMap';
import axios from 'axios';

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          fetchShifts(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          fetchShifts();
        }
      );
    } else {
      fetchShifts();
    }
  }, []);

  const fetchShifts = async (lat = null, lon = null) => {
    try {
      const params = {};
      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/shifts`,
        { params }
      );
      
      setShifts(response.data.shifts || []);
      setFilteredShifts(response.data.shifts || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === '') {
      setFilteredShifts(shifts);
    } else {
      const filtered = shifts.filter(shift =>
        shift.project_name.toLowerCase().includes(query) ||
        shift.title.toLowerCase().includes(query) ||
        shift.description.toLowerCase().includes(query)
      );
      setFilteredShifts(filtered);
    }
  };

  const handleShiftSelect = (shift) => {
    // Navigate to shift details or open modal
    console.log('Selected shift:', shift);
    // Implement shift detail view
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading volunteer opportunities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            Find Volunteer Opportunities Near You
          </h1>
          <p className="text-xl mb-8">
            Connect with local organizations, make an impact, and earn stipends
          </p>
          
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for opportunities, organizations, or skills..."
                className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              />
              <div className="absolute right-3 top-3">
                🔍
              </div>
            </div>
            {userLocation && (
              <p className="mt-2 text-sm opacity-90">
                📍 Showing opportunities near your location
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Available Shifts on Map
              </h2>
              <p className="text-gray-600">
                Click on markers to see shift details and sign up
              </p>
            </div>
            <SearchMap 
              onShiftSelect={handleShiftSelect}
              userLocation={userLocation}
            />
          </div>

          {/* Right Column - Shift List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Available Shifts ({filteredShifts.length})
              </h3>
              
              {filteredShifts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No shifts found matching your search
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {filteredShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleShiftSelect(shift)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{shift.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          shift.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {shift.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {shift.project_name}
                      </p>
                      
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          📅 {new Date(shift.shift_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          ⏰ {shift.start_time} - {shift.end_time}
                        </div>
                        <div className="flex items-center">
                          👥 {shift.volunteers_signed_up}/{shift.required_volunteers} spots
                        </div>
                        {shift.distance && (
                          <div className="flex items-center">
                            📍 {shift.distance.toFixed(1)} km away
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-bold text-blue-600">
                          KES {shift.stipend_estimate || '0'}
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Sign Up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;