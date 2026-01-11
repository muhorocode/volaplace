import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'volunteer'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'org_admin') {
          navigate('/org/dashboard');
        } else {
          navigate('/volunteer/shifts');
        }
        onClose();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after registration
        setMode('login');
        setLoginForm({ email: registerForm.email, password: registerForm.password });
        setError('');
        
        // Show success message briefly then auto-login
        setTimeout(async () => {
          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: registerForm.email, 
              password: registerForm.password 
            }),
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            localStorage.setItem('token', loginData.access_token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            
            if (loginData.user.role === 'admin') {
              navigate('/admin/dashboard');
            } else if (loginData.user.role === 'org_admin') {
              navigate('/org/dashboard');
            } else {
              navigate('/volunteer/shifts');
            }
            onClose();
          }
        }, 500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Join VolaPlace'}
          </h2>
          <p className="text-slate-600 mt-1">
            {mode === 'login' 
              ? 'Sign in to continue your journey' 
              : 'Start making a difference today'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="254712345678"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                I am joining as
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={registerForm.role}
                onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
              >
                <option value="volunteer">Volunteer</option>
                <option value="org_admin">Organization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle between Login/Register */}
        <div className="mt-6 text-center text-sm text-slate-600">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
