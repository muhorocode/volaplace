import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Home from './pages/Home';
import OrgDashboard from './pages/OrgDashboard';
import MyShifts from './pages/MyShifts';
import CheckInPage from './pages/CheckInPage';

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'org_admin') return <Navigate to="/org/dashboard" replace />;
    return <Navigate to="/volunteer/shifts" replace />;
  }
  
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading VolaPlace...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Home />} />
      
      {/* Organization routes */}
      <Route path="/org/dashboard" element={
        <ProtectedRoute allowedRoles={['org_admin', 'admin']}>
          <OrgDashboard />
        </ProtectedRoute>
      } />
      
      {/* Volunteer routes */}
      <Route path="/volunteer/shifts" element={
        <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
          <MyShifts />
        </ProtectedRoute>
      } />
      <Route path="/volunteer/checkin/:shiftId" element={
        <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
          <CheckInPage />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
