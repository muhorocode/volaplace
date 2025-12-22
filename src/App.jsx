import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import About from "./pages/About";

import Sidebar from "./components/component/Sidebar";
import Navbar from "./components/component/Navbar";


import "./App.css";

export default function App() {
  const { user } = useAuth();

  /* Not logged in → Auth pages only */
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  /* Logged in → Dashboard layout */
  return (
    <div style={{ backgroundColor: "#212121" }} className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col w-full">
        <Navbar />

        <Routes>
          {/* Volunteer */}
          {user.role === "Volunteer" && (
            <>
              <Route path="/volunteer" element={<VolunteerDashboard />} />
              <Route path="/" element={<Navigate to="/volunteer" />} />
            </>
          )}

          {/* Organization / Admin */}
          {user.role === "Organization" && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/" element={<Navigate to="/admin" />} />
            </>
          )}

          {/* Shared routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
