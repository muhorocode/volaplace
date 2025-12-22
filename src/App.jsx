import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditTable from "./components/Admin/AuditTable"; // ✅ fixed path

import Home from "./pages/Home";
import About from "./pages/About";

import Sidebar from "./components/component/Sidebar";
import Navbar from "./components/component/Navbar";

import "./App.css";

/* -------- Protected Route Wrapper -------- */
function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (allowedRole && user.role !== allowedRole) {
    // Redirect unauthorized users
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  // -------- NOT LOGGED IN --------
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // -------- LOGGED IN LAYOUT --------
  return (
    <div className="flex h-screen bg-[#5d2c80ff]">
      <Sidebar />

      <div className="flex flex-col w-full">
        <Navbar />

        <Routes>
          {/* -------- VOLUNTEER ROUTES -------- */}
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRole="Volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* -------- ADMIN / ORGANIZATION ROUTES -------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="Organization">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRole="Organization">
                <AuditTable />
              </ProtectedRoute>
            }
          />

          {/* -------- SHARED ROUTES -------- */}
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* -------- DEFAULT REDIRECT -------- */}
          <Route
            path="/"
            element={
              user.role === "Volunteer" ? (
                <Navigate to="/volunteer" />
              ) : (
                <Navigate to="/admin" />
              )
            }
          />

          {/* -------- FALLBACK -------- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
