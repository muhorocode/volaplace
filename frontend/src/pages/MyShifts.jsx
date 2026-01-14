import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'available', 'completed', 'pending'
  const [selectedShift, setSelectedShift] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutShiftId, setCheckoutShiftId] = useState(null);
  const [beneficiariesCount, setBeneficiariesCount] = useState('');
  const [showShiftDetails, setShowShiftDetails] = useState(null);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalHours: 0,
    totalBeneficiaries: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is volunteer
    if (!user || user.role !== 'volunteer') {
      navigate('/');
      return;
    }
    
    fetchMyShifts();
    fetchAvailableShifts();
  }, [navigate, user]);

  const fetchMyShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all shifts first (we'll filter user-specific ones later when backend supports it)
      const response = await axios.get(`${API_URL}/api/shifts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setShifts(response.data || []);
      calculateStats(response.data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      // If unauthorized, redirect to home
      if (err.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get available shifts for signup
      const response = await axios.get(`${API_URL}/api/shifts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Filter to only upcoming shifts with spots available
      const available = (response.data || []).filter(
        s => s.status === 'upcoming' && (s.volunteers_signed_up || 0) < s.max_volunteers
      );
      setAvailableShifts(available);
    } catch (err) {
      console.error('Error fetching available shifts:', err);
    }
  };

  const calculateStats = (shiftList) => {
    const completed = shiftList.filter(s => s.status === 'completed');
    
    const totalEarned = completed.reduce((sum, shift) => 
      sum + (shift.payout_amount || 0), 0
    );
    
    const totalHours = completed.reduce((sum, shift) => {
      if (shift.start_time && shift.end_time) {
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        const hours = (end - start) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const totalBeneficiaries = completed.reduce((sum, shift) => 
      sum + (shift.beneficiaries_served || 0), 0
    );
    
    setStats({
      totalEarned,
      totalHours: Math.round(totalHours * 10) / 10,
      totalBeneficiaries
    });
  };

  const handleCheckIn = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/shifts/${shiftId}/checkin`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Checked in successfully!');
        fetchMyShifts();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to check in');
      console.error('Error checking in:', err);
    }
  };

  const openCheckoutModal = (shiftId) => {
    setCheckoutShiftId(shiftId);
    setBeneficiariesCount('');
    setShowCheckoutModal(true);
  };

  const handleCheckOut = async () => {
    if (!beneficiariesCount || isNaN(beneficiariesCount) || parseInt(beneficiariesCount) < 0) {
      toast.error('Please enter a valid number of beneficiaries');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/shifts/${checkoutShiftId}/checkout`,
        { beneficiaries_served: parseInt(beneficiariesCount) },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        const { message, payout_amount, payment_status } = response.data;
        
        if (payment_status === 'completed') {
          toast.success(`${message} You earned KES ${payout_amount}!`);
        } else if (payment_status === 'partial') {
          toast.success(message);
        } else {
          toast.success(`Checked out! Earned KES ${payout_amount}. ${message}`);
        }
        
        setShowCheckoutModal(false);
        setCheckoutShiftId(null);
        setBeneficiariesCount('');
        fetchMyShifts();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to check out');
      console.error('Error checking out:', err);
    }
  };

  const handleRegisterForShift = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/shifts/${shiftId}/register`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Successfully registered for shift!');
        fetchMyShifts();
        fetchAvailableShifts();
        setActiveTab('upcoming');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register for shift');
      console.error('Error registering:', err);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    // Only show shifts the volunteer has registered for
    if (!shift.roster_status) return false;
    
    switch (activeTab) {
      case 'upcoming':
        return shift.status === 'upcoming' || shift.status === 'registered' || shift.status === 'checked_in';
      case 'completed':
        return shift.status === 'completed';
      case 'pending':
        return shift.status === 'pending_payment';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading your shifts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Volunteer Shifts
          </h1>
          <p className="text-gray-600 mt-2">
            Track your volunteering journey and earnings
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Earned</p>
                <p className="text-3xl font-bold mt-2">
                  KES {stats.totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Hours</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalHours} hrs
                </p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Beneficiaries Served</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalBeneficiaries.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available ({availableShifts.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Payment
              </button>
            </nav>
          </div>
        </div>

        {/* Available Shifts Section */}
        {activeTab === 'available' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {availableShifts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No available shifts at the moment.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availableShifts.map((shift) => (
                  <li key={shift.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{shift.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>📅 {new Date(shift.date).toLocaleDateString()}</span>
                          <span>🕐 {shift.start_time} - {shift.end_time}</span>
                          <span>📍 {shift.project?.name || 'Location TBD'}</span>
                          <span>👥 {shift.volunteers_signed_up || 0}/{shift.max_volunteers} volunteers</span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => setShowShiftDetails(shift)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRegisterForShift(shift.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Shifts List */}
        {activeTab !== 'available' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredShifts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No {activeTab} shifts found.
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Find Volunteer Opportunities
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredShifts.map((shift) => (
                <li key={shift.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {shift.title}
                        </h3>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          shift.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : shift.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shift.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {shift.project_name}
                      </p>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(shift.shift_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span>{' '}
                          {shift.start_time} - {shift.end_time}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>{' '}
                          {shift.location || 'On-site'}
                        </div>
                        {shift.payout_amount && (
                          <div className="text-green-600 font-bold">
                            KES {shift.payout_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      {shift.beneficiaries_served > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Impact:</span>{' '}
                          Served {shift.beneficiaries_served} beneficiaries
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ml-4 flex flex-col space-y-2">
                      {shift.status === 'upcoming' && (
                        <>
                          <button
                            onClick={() => handleCheckIn(shift.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => setShowShiftDetails(shift)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </>
                      )}
                      
                      {shift.status === 'checked_in' && (
                        <button
                          onClick={() => openCheckoutModal(shift.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Check Out
                        </button>
                      )}
                      
                      {shift.status === 'completed' && (
                        <button
                          onClick={() => setShowShiftDetails(shift)}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          View Details
                        </button>
                      )}
                      
                      {shift.status === 'pending_payment' && (
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded text-center">
                          Payment Processing
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        )}

        {/* Payment History */}
        {activeTab === 'completed' && filteredShifts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Payment History
            </h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiaries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShifts.map((shift) => (
                    <tr key={shift.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(shift.shift_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shift.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shift.duration || '4 hours'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shift.beneficiaries_served || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        KES {shift.payout_amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Check Out</h3>
              <p className="text-gray-600 mb-4">How many beneficiaries did you serve during this shift?</p>
              <input
                type="number"
                min="0"
                value={beneficiariesCount}
                onChange={(e) => setBeneficiariesCount(e.target.value)}
                placeholder="Enter number of beneficiaries"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckOut}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Complete Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shift Details Modal */}
        {showShiftDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{showShiftDetails.title}</h3>
                <button 
                  onClick={() => setShowShiftDetails(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-600">{showShiftDetails.description || 'No description available'}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p>{new Date(showShiftDetails.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <p>{showShiftDetails.start_time} - {showShiftDetails.end_time}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p>{showShiftDetails.project?.name || 'TBD'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Volunteers:</span>
                    <p>{showShiftDetails.volunteers_signed_up || 0}/{showShiftDetails.max_volunteers}</p>
                  </div>
                </div>
                
                {showShiftDetails.project && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      📍 Coordinates: {showShiftDetails.project.lat?.toFixed(4)}, {showShiftDetails.project.lon?.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowShiftDetails(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRegisterForShift(showShiftDetails.id);
                    setShowShiftDetails(null);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Register for Shift
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyShifts;