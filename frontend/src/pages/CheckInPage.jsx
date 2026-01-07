import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

function CheckInPage() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [shift, setShift] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setMessage('Getting your location...');

    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(coords);
        setMessage(`Location acquired: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        setLoading(false);
      },
      (error) => {
        setMessage(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Check in to a shift
  const handleCheckIn = async (shiftId) => {
    if (!location) {
      setMessage('Please get your location first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/attendance/check-in', {
        shift_id: shiftId,
        latitude: location.latitude,
        longitude: location.longitude
      });

      setMessage(`✅ Checked in successfully! ${response.data.message}`);
      setShift(response.data.shift);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Check-in failed';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Check out from a shift
  const handleCheckOut = async (shiftId) => {
    if (!location) {
      setMessage('Please get your location first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/attendance/check-out', {
        shift_id: shiftId,
        latitude: location.latitude,
        longitude: location.longitude
      });

      setMessage(`✅ Checked out successfully! Total hours: ${response.data.hours_worked}`);
      
      // Trigger payment if available
      if (response.data.payment_eligible) {
        setMessage(prev => prev + '\n💰 Payment processing...');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Check-out failed';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="check-in-page">
      <h1>Shift Check-In</h1>
      
      <div className="location-section">
        <h2>Your Location</h2>
        {location ? (
          <div className="location-info">
            <p>Latitude: {location.latitude.toFixed(6)}</p>
            <p>Longitude: {location.longitude.toFixed(6)}</p>
            <p>Accuracy: {location.accuracy.toFixed(0)}m</p>
          </div>
        ) : (
          <button onClick={getCurrentLocation} disabled={loading}>
            {loading ? 'Getting location...' : 'Get My Location'}
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="actions">
        <h2>Quick Actions</h2>
        <button 
          onClick={() => handleCheckIn(1)} 
          disabled={!location || loading}
          className="btn-check-in"
        >
          Check In to Shift
        </button>
        
        <button 
          onClick={() => handleCheckOut(1)} 
          disabled={!location || loading}
          className="btn-check-out"
        >
          Check Out from Shift
        </button>
      </div>

      {shift && (
        <div className="shift-info">
          <h3>Current Shift</h3>
          <p><strong>Project:</strong> {shift.project_name}</p>
          <p><strong>Location:</strong> {shift.address}</p>
          <p><strong>Distance:</strong> {shift.distance_from_geofence}m</p>
        </div>
      )}

      <style jsx>{`
        .check-in-page {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
        }

        .location-section, .actions {
          margin: 2rem 0;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .location-info p {
          margin: 0.5rem 0;
          font-family: monospace;
        }

        .message {
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 8px;
          white-space: pre-line;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        button {
          padding: 0.75rem 1.5rem;
          margin: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-check-in {
          background: #28a745;
          color: white;
        }

        .btn-check-out {
          background: #dc3545;
          color: white;
        }

        .shift-info {
          margin-top: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default CheckInPage;
