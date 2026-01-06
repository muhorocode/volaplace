import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '', 
    role: 'volunteer' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white">
        <h2 className="text-3xl font-bold text-center">Create Account 🚀</h2>
        <p className="text-center text-gray-200 mb-6">
          Join VolaPlace today
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 text-green-200 text-sm p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={handleChange}
            value={form.name}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={handleChange}
            value={form.email}
          />

          <input
            name="phone"
            type="tel"
            placeholder="Phone (254712345678)"
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={handleChange}
            value={form.phone}
          />

          <select
            name="role"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white"
            onChange={handleChange}
            value={form.role}
          >
            <option value="volunteer" className="text-gray-900">Volunteer</option>
            <option value="org_admin" className="text-gray-900">Organization</option>
          </select>

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'} // TOGGLE
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white pr-12"
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200 text-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading
                ? 'bg-white/50 cursor-not-allowed'
                : 'bg-white text-blue-700 hover:scale-105'
            }`}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
