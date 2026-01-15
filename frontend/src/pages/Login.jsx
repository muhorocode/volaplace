import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if account is locked
    const lockoutKey = `lockout_${email}`;
    const attemptsKey = `attempts_${email}`;
    const lockoutData = localStorage.getItem(lockoutKey);
    
    if (lockoutData) {
      const lockoutUntil = new Date(lockoutData);
      const now = new Date();
      
      if (now < lockoutUntil) {
        const minutesLeft = Math.ceil((lockoutUntil - now) / 60000);
        setError(`Too many failed attempts. Please try again in ${minutesLeft} minute(s).`);
        setIsLocked(true);
        setLockoutTime(lockoutUntil);
        return;
      } else {
        // Lockout expired
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
        setIsLocked(false);
      }
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear form and attempts on success
        setEmail('');
        setPassword('');
        localStorage.removeItem(attemptsKey);
        localStorage.removeItem(lockoutKey);
        
        // Save token and user info
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'org_admin') {
          navigate('/org/dashboard');
        } else {
          navigate('/volunteer/shifts');
        }
      } else {
        // Track failed attempts
        const attempts = parseInt(localStorage.getItem(attemptsKey) || '0') + 1;
        localStorage.setItem(attemptsKey, attempts.toString());
        
        if (attempts >= 3) {
          // Lock account for 15 minutes
          const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
          localStorage.setItem(lockoutKey, lockoutUntil.toISOString());
          setError('Too many failed attempts. Account locked for 15 minutes.');
          setIsLocked(true);
          setLockoutTime(lockoutUntil);
          // Clear form
          setEmail('');
          setPassword('');
        } else {
          setError(data.error || `Login failed. ${3 - attempts} attempt(s) remaining.`);
          // Clear password only
          setPassword('');
        }
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="text-3xl font-bold tracking-tight">
            VolaPlace
          </Link>
          <p className="text-slate-400 mt-2">Welcome back to your community</p>
        </div>
        
        <div className="space-y-6">
          <blockquote className="text-2xl font-light leading-relaxed">
            "Service to others is the rent you pay for your room here on earth."
          </blockquote>
          <p className="text-slate-400">— Muhammad Ali</p>
        </div>

        <div className="text-sm text-slate-400">
          <p>New to VolaPlace?</p>
          <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-400">
            Create an account →
          </Link>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="text-2xl font-bold text-slate-900">
              VolaPlace
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-600 mt-2">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-lg mb-6 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-sm text-orange-600 hover:text-orange-700">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
