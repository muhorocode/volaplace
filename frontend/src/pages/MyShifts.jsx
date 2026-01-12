import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'pending'
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
        alert('Checked in successfully!');
        fetchMyShifts();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to check in');
      console.error('Error checking in:', err);
    }
  };

  const handleCheckOut = async (shiftId) => {
    const beneficiaries = prompt('How many beneficiaries did you serve?');
    if (!beneficiaries || isNaN(beneficiaries)) {
      alert('Please enter a valid number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/shifts/${shiftId}/checkout`,
        { beneficiaries_served: parseInt(beneficiaries) },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        alert('Checked out successfully! Payment has been processed.');
        fetchMyShifts();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to check out');
      console.error('Error checking out:', err);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    switch (activeTab) {
      case 'upcoming':
        return shift.status === 'upcoming';
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

        {/* Shifts List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredShifts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No {activeTab} shifts found.
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => navigate('/')}
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
                            onClick={() => navigate(`/shift/${shift.id}/details`)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </>
                      )}
                      
                      {shift.status === 'checked_in' && (
                        <button
                          onClick={() => handleCheckOut(shift.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Check Out
                        </button>
                      )}
                      
                      {shift.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/shift/${shift.id}/receipt`)}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          View Receipt
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
      </main>
    </div>
  );
};

export default MyShifts;