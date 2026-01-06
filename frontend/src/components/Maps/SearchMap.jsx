import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/shifts`,
        { params }
      );
      
      setShifts(response.data.shifts || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom icons
  const getShiftIcon = (shiftType) => {
    const iconUrl = shiftType === 'active' 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    
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

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-lg text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
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
        {shifts.map((shift) => (
          <div key={shift.id}>
            <Marker
              position={[shift.project_latitude, shift.project_longitude]}
              icon={getShiftIcon(shift.status)}
              eventHandlers={{
                click: () => handleShiftClick(shift)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{shift.project_name}</h3>
                  <p className="text-sm text-gray-600">{shift.title}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      📅 {new Date(shift.shift_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      ⏰ {shift.start_time} - {shift.end_time}
                    </p>
                    <p className="text-sm">
                      👥 {shift.volunteers_signed_up}/{shift.required_volunteers} volunteers
                    </p>
                    <p className="text-sm">
                      📍 Distance: {shift.distance ? `${shift.distance.toFixed(1)} km` : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleShiftClick(shift)}
                    className="mt-3 w-full bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
            
            {/* Geofence circle */}
            <Circle
              center={[shift.project_latitude, shift.project_longitude]}
              radius={shift.geofence_radius || 100}
              pathOptions={{ 
                color: shift.status === 'active' ? 'green' : 'blue',
                fillOpacity: 0.1 
              }}
            />
          </div>
        ))}
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