import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ProfileUpdate from '../components/ProfileUpdate';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// LocalStorage helpers to persist roster status across refresh/logout
const ROSTER_STORAGE_KEY = 'volunteer_roster_status';

const saveRosterStatus = (userId, shiftId, status, additionalData = {}) => {
  try {
    const stored = JSON.parse(localStorage.getItem(ROSTER_STORAGE_KEY) || '{}');
    if (!stored[userId]) stored[userId] = {};
    stored[userId][shiftId] = {
      roster_status: status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.error('Error saving roster status:', err);
  }
};

const getRosterStatus = (userId) => {
  try {
    const stored = JSON.parse(localStorage.getItem(ROSTER_STORAGE_KEY) || '{}');
    return stored[userId] || {};
  } catch (err) {
    console.error('Error reading roster status:', err);
    return {};
  }
};

const MyShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'upcoming', 'available', 'inprogress', 'completed', 'pending'
  const [selectedShift, setSelectedShift] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutShiftId, setCheckoutShiftId] = useState(null);
  const [beneficiariesCount, setBeneficiariesCount] = useState(0);
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
      
      // Merge backend data with localStorage roster status
      const rosterData = getRosterStatus(user?.id);
      const mergedShifts = (response.data || []).map(shift => {
        const savedRoster = rosterData[shift.id];
        if (savedRoster) {
          return {
            ...shift,
            roster_status: savedRoster.roster_status,
            check_in_time: savedRoster.check_in_time || shift.check_in_time,
            check_out_time: savedRoster.check_out_time || shift.check_out_time,
            is_paid: savedRoster.is_paid !== undefined ? savedRoster.is_paid : shift.is_paid,
            payout_amount: savedRoster.payout_amount || shift.payout_amount,
            beneficiaries_served: savedRoster.beneficiaries_served || shift.beneficiaries_served
          };
        }
        return shift;
      });
      
      setShifts(mergedShifts);
      calculateStats(mergedShifts);
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
      
      // Merge backend data with localStorage roster status
      const rosterData = getRosterStatus(user?.id);
      const mergedShifts = (response.data || []).map(shift => {
        const savedRoster = rosterData[shift.id];
        if (savedRoster) {
          return {
            ...shift,
            roster_status: savedRoster.roster_status,
            check_in_time: savedRoster.check_in_time || shift.check_in_time,
            check_out_time: savedRoster.check_out_time || shift.check_out_time,
            is_paid: savedRoster.is_paid !== undefined ? savedRoster.is_paid : shift.is_paid,
            payout_amount: savedRoster.payout_amount || shift.payout_amount,
            beneficiaries_served: savedRoster.beneficiaries_served || shift.beneficiaries_served
          };
        }
        return shift;
      });
      
      // Filter to show:
      // 1. Shifts not registered by user with spots available
      // 2. Shifts registered by user but not yet checked in (derive from check_in_time)
      const available = mergedShifts.filter(
        s => {
          const isAvailableShift = s.status === 'upcoming' && (s.volunteers_signed_up || 0) < s.max_volunteers && !s.roster_status && !s.check_in_time;
          const isRegisteredNotCheckedIn = s.roster_status === 'registered' || (!s.check_in_time && s.roster_status);
          return isAvailableShift || isRegisteredNotCheckedIn;
        }
      );
      setAvailableShifts(available);
    } catch (err) {
      console.error('Error fetching available shifts:', err);
    }
  };

  const fetchAllShifts = async () => {
    setLoading(true);
    try {
      await fetchMyShifts();
      await fetchAvailableShifts();
      toast.success('Data refreshed successfully!');
    } catch (err) {
      toast.error('Failed to refresh data');
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
        toast.success('Checked in successfully!');
        
        const now = new Date().toISOString();
        
        // Save to localStorage for persistence
        saveRosterStatus(user?.id, shiftId, 'checked_in', {
          check_in_time: now
        });
        
        // OPTIMISTIC UI UPDATE ONLY - DO NOT RE-FETCH
        // Update both shifts and availableShifts to keep state consistent
        // Set roster_status AND check_in_time for proper status derivation
        const updatedShift = availableShifts.find(s => s.id === shiftId);
        
        setShifts(prevShifts => {
          const existing = prevShifts.find(s => s.id === shiftId);
          if (existing) {
            return prevShifts.map(s => 
              s.id === shiftId 
                ? { ...s, roster_status: 'checked_in', check_in_time: now } 
                : s
            );
          } else {
            return [...prevShifts, { ...updatedShift, roster_status: 'checked_in', check_in_time: now }];
          }
        });
        
        setAvailableShifts(prevShifts => 
          prevShifts.map(s => 
            s.id === shiftId 
              ? { ...s, roster_status: 'checked_in', check_in_time: now } 
              : s
          )
        );
        
        // Switch to In Progress tab
        setActiveTab('inprogress');
      }
    } catch (err) {
      // Check for geofence error specifically
      const errorMsg = err.response?.data?.error || '';
      if (errorMsg.toLowerCase().includes('geofence') || 
          errorMsg.toLowerCase().includes('location') ||
          errorMsg.toLowerCase().includes('radius')) {
        toast.error('You must be at the location to check in.');
      } else {
        toast.error(errorMsg || 'Failed to check in');
      }
      console.error('Error checking in:', err);
    }
  };

  const openCheckoutModal = (shiftId) => {
    setCheckoutShiftId(shiftId);
    setBeneficiariesCount(0);
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
        
        const now = new Date().toISOString();
        
        // Save to localStorage as PENDING_PAYMENT (waiting for admin approval)
        saveRosterStatus(user?.id, checkoutShiftId, 'pending_payment', {
          check_out_time: now,
          payout_amount,
          beneficiaries_served: parseInt(beneficiariesCount),
          is_paid: false
        });
        
        toast.success(`Checked out! Payment pending admin approval. Expected: KES ${payout_amount}`);
        
        // OPTIMISTIC UI UPDATE - Set to PENDING_PAYMENT (not completed yet)
        setShifts(prevShifts => 
          prevShifts.map(s => 
            s.id === checkoutShiftId 
              ? { 
                  ...s, 
                  roster_status: 'pending_payment', 
                  is_paid: false, 
                  check_out_time: now, 
                  payout_amount, 
                  beneficiaries_served: parseInt(beneficiariesCount) 
                } 
              : s
          )
        );
        
        setAvailableShifts(prevShifts => 
          prevShifts.map(s => 
            s.id === checkoutShiftId 
              ? { 
                  ...s, 
                  roster_status: 'pending_payment', 
                  is_paid: false, 
                  check_out_time: now, 
                  payout_amount, 
                  beneficiaries_served: parseInt(beneficiariesCount) 
                } 
              : s
          )
        );
        
        setShowCheckoutModal(false);
        setCheckoutShiftId(null);
        setBeneficiariesCount(0);
        
        // Switch to Pending Payment tab
        setActiveTab('pending');
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
        
        // Save to localStorage for persistence
        saveRosterStatus(user?.id, shiftId, 'registered');
        
        // OPTIMISTIC UI UPDATE ONLY - DO NOT RE-FETCH
        // Update both availableShifts and shifts to keep state consistent
        setAvailableShifts(prevShifts => 
          prevShifts.map(s => 
            s.id === shiftId 
              ? { ...s, roster_status: 'registered', volunteers_signed_up: (s.volunteers_signed_up || 0) + 1 } 
              : s
          )
        );
        
        setShifts(prevShifts => {
          const existing = prevShifts.find(s => s.id === shiftId);
          const shiftData = availableShifts.find(s => s.id === shiftId);
          
          if (existing) {
            return prevShifts.map(s => 
              s.id === shiftId 
                ? { ...s, roster_status: 'registered', volunteers_signed_up: (s.volunteers_signed_up || 0) + 1 } 
                : s
            );
          } else {
            return [...prevShifts, { ...shiftData, roster_status: 'registered', volunteers_signed_up: (shiftData.volunteers_signed_up || 0) + 1 }];
          }
        });
        
        // Stay on available tab to show Check In button
        setActiveTab('available');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register for shift');
      console.error('Error registering:', err);
    }
  };

  // Function to refresh data and check for payment updates
  const handleRefreshData = async () => {
    toast.loading('Refreshing data...');
    await fetchMyShifts();
    await fetchAvailableShifts();
    toast.dismiss();
    toast.success('Data refreshed!');
  };

  // Helper function to derive shift status from raw data fields
  // CRITICAL: Check backend-authoritative fields (is_paid) BEFORE local roster_status
  const deriveShiftStatus = (shift) => {
    // FIRST: Check if payment is completed (backend-authoritative)
    // This ensures admin-approved payments override local state
    if (shift.is_paid === true) {
      return 'completed';
    }
    
    // SECOND: Check if checked out and has payout (backend says completed)
    if (shift.check_out_time && shift.payout_amount > 0 && shift.is_paid !== false) {
      return 'completed';
    }
    
    // THIRD: Use roster_status for in-progress states (optimistic updates)
    // But DON'T trust it for 'completed' since admin approval changes that
    if (shift.roster_status && shift.roster_status !== 'completed') {
      return shift.roster_status;
    }
    
    // Pending Payment: check_out_time exists AND explicitly not paid
    if (shift.check_out_time && shift.is_paid === false) {
      return 'pending_payment';
    }
    
    // In Progress (Checked In): check_in_time exists AND check_out_time is null
    if (shift.check_in_time && !shift.check_out_time) {
      return 'checked_in';
    }
    
    // Registered: has roster_status but no check-in
    if (shift.roster_status === 'registered') {
      return 'registered';
    }
    
    // Available: no interactions yet
    return 'available';
  };

  const filteredShifts = shifts.filter(shift => {
    // Derive the actual status from raw data fields
    const actualStatus = deriveShiftStatus(shift);
    
    // Only show shifts the volunteer has registered for (or has interaction with)
    // Skip shifts with no check_in_time, no roster_status, AND not paid
    if (!shift.check_in_time && !shift.roster_status && !shift.is_paid) return false;
    
    switch (activeTab) {
      case 'upcoming':
        // Show only registered status (not checked in yet)
        return actualStatus === 'registered';
      case 'inprogress':
        // Show checked_in status shifts
        return actualStatus === 'checked_in';
      case 'pending':
        // Show checked out but payment pending admin approval
        return actualStatus === 'pending_payment';
      case 'completed':
        // Show completed and paid shifts
        // ROBUST: Check derived status OR is_paid flag directly
        return actualStatus === 'completed' || shift.is_paid === true;
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Volunteer Shifts
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Track your volunteering journey and earnings
              </p>
            </div>
            <button
              onClick={fetchAllShifts}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
        <div className="mb-6 bg-white rounded-lg shadow overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex min-w-max">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'available'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available ({availableShifts.length})
              </button>
              <button
                onClick={() => setActiveTab('inprogress')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'inprogress'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Payment
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 sm:py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileUpdate />
        )}

        {/* Available Shifts Section */}
        {activeTab === 'available' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {availableShifts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No available shifts at the moment.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availableShifts.map((shift) => {
                  // DEBUGGING: Log shift status for troubleshooting
                  console.log("Shift:", shift.id, "Roster Status:", shift.roster_status, "Is Funded:", shift.is_funded, "Check In:", shift.check_in_time, "Check Out:", shift.check_out_time, "Is Paid:", shift.is_paid);
                  
                  // Derive actual status from raw data fields (REFRESH-PROOF)
                  const actualStatus = (() => {
                    if (shift.is_paid === true || (shift.check_out_time && shift.payout_amount > 0)) return 'completed';
                    if (shift.check_out_time && !shift.is_paid) return 'pending_payment';
                    if (shift.check_in_time && !shift.check_out_time) return 'checked_in';
                    if (shift.roster_status === 'registered' || (!shift.check_in_time && shift.roster_status)) return 'registered';
                    return 'available';
                  })();
                  
                  // STRICT STATE MACHINE LOGIC - BASED ON DERIVED STATUS
                  const renderActionButton = () => {
                    // STEP 4: If completed or paid -> Show Paid/Completed Badge
                    if (actualStatus === 'completed') {
                      return (
                        <span className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-100 text-green-800 text-xs sm:text-sm rounded text-center font-semibold">
                          ✓ Paid/Completed
                        </span>
                      );
                    }
                    
                    // STEP 3: If checked_in -> Show ORANGE "Check Out" button
                    if (actualStatus === 'checked_in') {
                      return (
                        <button
                          onClick={() => openCheckoutModal(shift.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-orange-600 text-white text-xs sm:text-sm rounded hover:bg-orange-700 font-medium"
                        >
                          Check Out
                        </button>
                      );
                    }
                    
                    // STEP 2: If registered -> Show GREEN "Check In" button
                    if (actualStatus === 'registered') {
                      return (
                        <button
                          onClick={() => handleCheckIn(shift.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 font-medium"
                        >
                          Check In
                        </button>
                      );
                    }
                    
                    // STEP 1: If available -> Show BLUE "Register" button
                    return (
                      <button
                        onClick={() => handleRegisterForShift(shift.id)}
                        disabled={!shift.is_funded}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded font-medium ${
                          shift.is_funded
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!shift.is_funded ? 'This shift must be funded before registration' : 'Register for this shift'}
                      >
                        {shift.is_funded ? 'Register' : 'Not Funded'}
                      </button>
                    );
                  };
                  
                  return (
                  <li key={shift.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900">{shift.title}</h3>
                          {shift.is_funded && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              ✓ Funded
                            </span>
                          )}
                          {!shift.is_funded && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Not Funded
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{shift.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <span>📅 {new Date(shift.date).toLocaleDateString()}</span>
                          <span>🕐 {shift.start_time} - {shift.end_time}</span>
                          <span>📍 {shift.project?.name || 'Location TBD'}</span>
                          <span>👥 {shift.volunteers_signed_up || 0}/{shift.max_volunteers} volunteers</span>
                          {shift.is_funded && shift.funded_amount > 0 && (
                            <span className="text-green-600 font-semibold">💰 KES {shift.funded_amount.toLocaleString()} budget</span>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                        <button
                          onClick={() => setShowShiftDetails(shift)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded hover:bg-gray-200"
                        >
                          View Details
                        </button>
                        {renderActionButton()}
                      </div>
                    </div>
                  </li>
                  );
                })}
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
              {filteredShifts.map((shift) => {
                // DEBUGGING: Log shift status for troubleshooting
                console.log("Shift (Other Tabs):", shift.id, "Roster Status:", shift.roster_status, "Tab:", activeTab);
                
                return (
                <li key={shift.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {shift.title}
                        </h3>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          shift.roster_status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : shift.roster_status === 'registered'
                            ? 'bg-blue-100 text-blue-800'
                            : shift.roster_status === 'checked_in'
                            ? 'bg-green-100 text-green-800'
                            : shift.roster_status === 'pending_payment'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(shift.roster_status || 'Unknown').replace(/_/g, ' ').toUpperCase()}
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
                      {shift.roster_status === 'registered' && (
                        <>
                          <button
                            onClick={() => handleCheckIn(shift.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => setShowShiftDetails(shift)}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            View Details
                          </button>
                        </>
                      )}
                      
                      {shift.roster_status === 'checked_in' && (
                        <>
                          <button
                            onClick={() => openCheckoutModal(shift.id)}
                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                          >
                            Check Out
                          </button>
                          <button
                            onClick={() => setShowShiftDetails(shift)}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            View Details
                          </button>
                        </>
                      )}
                      
                      {(shift.roster_status === 'pending_payment' || shift.roster_status === 'completed') && (
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
                );
              })}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Check Out</h3>
              <p className="text-gray-600 mb-4">How many beneficiaries did you serve during this shift?</p>
              <input
                type="number"
                min="0"
                value={beneficiariesCount === 0 ? '' : beneficiariesCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setBeneficiariesCount(val === '' ? 0 : Number(val));
                }}
                placeholder="Enter number of beneficiaries"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setBeneficiariesCount(0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckOut}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                >
                  Complete Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shift Details Modal */}
        {showShiftDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
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

      <Footer />
    </div>
  );
};

export default MyShifts;