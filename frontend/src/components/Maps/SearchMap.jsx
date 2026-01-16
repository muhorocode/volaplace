import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Import marker images using ES6 syntax
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SearchMap = ({ onShiftSelect, userLocation }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]); // Default Nairobi
  const mapRef = useRef(null);

  useEffect(() => {
    fetchShifts();
    
    // Use user location if available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  useEffect(() => {
    // Center map when location changes
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation]);

  const fetchShifts = async () => {
    try {
      const params = {};
      if (userLocation) {
        params.lat = userLocation.latitude;
        params.lon = userLocation.longitude;
      }

      // Use public endpoint without auth for homepage
      const response = await axios.get(
        `${API_URL}/api/shifts`,
        { params }
      );
      
      // Handle both array response and object with shifts property
      const shiftsData = Array.isArray(response.data) ? response.data : (response.data.shifts || response.data || []);
      
      // Filter to show only upcoming shifts with available spots
      const availableShifts = shiftsData.filter(s => 
        s.status === 'upcoming' && 
        s.is_funded && 
        (s.volunteers_signed_up || 0) < s.max_volunteers
      );
      
      setShifts(availableShifts);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  // Custom icons - different colors for shift status
  // REQUIREMENT: User Location=RED, Active/In-Progress=GREEN, Upcoming=BLUE
  const getShiftIcon = (shift) => {
    const now = new Date();
    const shiftDate = new Date(shift.date);
    const isPast = shiftDate < now;
    
    // Check if shift is active/in-progress
    const isActive = shift.status === 'in_progress' || 
                     shift.status === 'checked_in' || 
                     shift.status === 'active' ||
                     shift.roster_status === 'checked_in';
    
    const isUpcoming = shift.status === 'upcoming';
    
    let iconUrl;
    if (shift.status === 'completed' || isPast) {
      // Gray for completed/past shifts
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
    } else if (isActive) {
      // GREEN for active/in-progress shifts
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
    } else if (isUpcoming) {
      // BLUE for upcoming shifts
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    } else {
      // Blue default
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    }
    
    return new L.Icon({
      iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const handleShiftClick = (shift) => {
    if (onShiftSelect) {
      onShiftSelect(shift);
    }
  };

  const handleViewDetails = (shift) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // User is logged in - navigate to shift details/register page
      window.location.href = `/volunteer/shifts?shiftId=${shift.id}`;
    } else {
      // User is logged out - save intended destination and redirect to login
      localStorage.setItem('redirect_after_login', `/volunteer/shifts?shiftId=${shift.id}`);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Shift markers */}
        {shifts.map((shift) => {
          // Get project coordinates - handle different data structures
          const lat = shift.project?.lat || shift.project_latitude;
          const lon = shift.project?.lon || shift.project_longitude;
          const projectName = shift.project?.name || shift.project_name || 'Unknown Project';
          const geofenceRadius = shift.project?.geofence_radius || shift.geofence_radius || 100;
          
          // Skip if no valid coordinates
          if (!lat || !lon) return null;
          
          return (
          <div key={shift.id}>
            <Marker
              position={[lat, lon]}
              icon={getShiftIcon(shift)}
              eventHandlers={{
                click: () => handleShiftClick(shift)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{projectName}</h3>
                  <p className="text-sm text-gray-600">{shift.title}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      📅 {shift.date ? new Date(shift.date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm">
                      ⏰ {shift.start_time} - {shift.end_time}
                    </p>
                    <p className="text-sm">
                      👥 {shift.max_volunteers || 0} volunteers needed
                    </p>
                    {shift.distance_km && (
                      <p className="text-sm">
                        📍 Distance: {shift.distance_km.toFixed(1)} km
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewDetails(shift)}
                    className="mt-3 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
            
            {/* Geofence circle */}
            <Circle
              center={[lat, lon]}
              radius={geofenceRadius}
              pathOptions={{ 
                color: shift.status === 'active' ? 'green' : 'blue',
                fillOpacity: 0.1 
              }}
            />
          </div>
        )})}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Active Shifts</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Upcoming Shifts</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchMap;