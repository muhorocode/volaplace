import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import OrgDashboard from './pages/OrgDashboard';
import MyShifts from './pages/MyShifts';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`)
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  // Optional: block app if backend is down
  if (apiStatus === 'checking') return null;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/org/dashboard" element={<OrgDashboard />} />
      <Route path="/volunteer/shifts" element={<MyShifts />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
