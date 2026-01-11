import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  // Update mode when modal opens with a new initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
    }
  }, [isOpen, initialMode]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'volunteer'
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isStrong: false,
  });

  // Password strength validation
  useEffect(() => {
    const password = registerForm.password;
    const strength = {
      hasMinLength: password.length >= 10,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    strength.isStrong = Object.values(strength).every(v => v);
    setPasswordStrength(strength);
  }, [registerForm.password]);

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
        // Store data first
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update AuthContext state
        setCurrentUser(data.user);
        
        // Close modal first
        onClose();
        
        // Small delay to let state propagate, then navigate
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (data.user.role === 'org_admin') {
            navigate('/org/dashboard');
          } else {
            navigate('/volunteer/shifts');
          }
        }, 100);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone) {
      setError('All fields are required');
      return;
    }

    // Password strength check
    if (!passwordStrength.isStrong) {
      setError('Password does not meet strength requirements');
      return;
    }

    // Password confirmation check
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = registerForm;
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after registration
        setError('');
        
        // Auto-login after a brief delay
        setTimeout(async () => {
          try {
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
              
              // Update AuthContext state
              setCurrentUser(loginData.user);
              
              // Close modal first
              onClose();
              
              // Navigate after brief delay
              setTimeout(() => {
                if (loginData.user.role === 'admin') {
                  navigate('/admin/dashboard');
                } else if (loginData.user.role === 'org_admin') {
                  navigate('/org/dashboard');
                } else {
                  navigate('/volunteer/shifts');
                }
              }, 100);
            } else {
              setError('Registration successful but auto-login failed. Please login manually.');
              setMode('login');
              setLoginForm({ email: registerForm.email, password: '' });
            }
          } catch (loginErr) {
            console.error('Auto-login error:', loginErr);
            setError('Registration successful but auto-login failed. Please login manually.');
            setMode('login');
            setLoginForm({ email: registerForm.email, password: '' });
          }
        }, 300);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {registerForm.password && (
                <div className="mt-2 space-y-2">
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-slate-400'}`}>
                      <span>{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                      <span>At least 10 characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-slate-400'}`}>
                      <span>{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-slate-400'}`}>
                      <span>{passwordStrength.hasNumber ? '✓' : '○'}</span>
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-slate-400'}`}>
                      <span>{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                      <span>One special character (!@#$%^&*)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.isStrong ? 'bg-green-500 w-full' :
                        Object.values(passwordStrength).filter(Boolean).length >= 3 ? 'bg-yellow-500 w-3/4' :
                        Object.values(passwordStrength).filter(Boolean).length >= 2 ? 'bg-orange-500 w-1/2' :
                        'bg-red-500 w-1/4'
                      }`}
                    ></div>
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength.isStrong ? 'text-green-600' :
                    Object.values(passwordStrength).filter(Boolean).length >= 3 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.isStrong ? 'Strong password!' :
                     Object.values(passwordStrength).filter(Boolean).length >= 3 ? 'Almost there...' :
                     'Weak password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-orange-500'
                  } focus:ring-2 focus:border-transparent transition`}
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {registerForm.confirmPassword && (
                <p className={`text-xs mt-1 ${
                  registerForm.password === registerForm.confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  {registerForm.password === registerForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordStrength.isStrong || registerForm.password !== registerForm.confirmPassword}
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
