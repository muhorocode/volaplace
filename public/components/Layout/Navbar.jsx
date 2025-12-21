import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-xl text-gray-700">VolaPlace</span>

        {/* Optional dashboard link */}
        {user?.role === "Volunteer" && (
          <Link
            to="/volunteer"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Volunteer Dashboard
          </Link>
        )}
        {user?.role === "Organization" && (
          <Link
            to="/admin"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <>
            <span className="text-gray-600 font-medium">{user.role}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
