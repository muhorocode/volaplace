import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  // Don't show navbar on homepage
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Home</span>
            </button>
            <Link to="/" className="text-xl font-bold hover:text-orange-400 transition">
              VolaPlace
            </Link>
          </div>

          {/* Right side - User info and Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-slate-300">Welcome, </span>
                <span className="font-medium">{user.name || user.email}</span>
                <span className="ml-2 px-2 py-1 bg-orange-600 rounded-full text-xs uppercase">
                  {user.role === 'org_admin' ? 'Org Admin' : user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
