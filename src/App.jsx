import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Routes for users who are not logged in */}
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}

      {/* Routes for logged-in Volunteers */}
      {user?.role === "Volunteer" && (
        <>
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/" element={<Navigate to="/volunteer" />} />
          <Route path="*" element={<Navigate to="/volunteer" />} />
        </>
      )}

      {/* Routes for logged-in Organization/Admin */}
      {user?.role === "Organization" && (
        <>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </>
      )}
    </Routes>
  );
}

