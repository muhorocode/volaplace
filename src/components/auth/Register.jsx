import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { login } = useAuth(); // we’ll mock registration as login
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Volunteer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // For demo, register = login
      login(form.email, form.password, form.role);
      navigate(form.role === 'Volunteer' ? '/volunteer' : '/admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-white">
        <h2 className="text-3xl font-bold text-center">Create Account 🚀</h2>
        <p className="text-center text-gray-200 mb-6">Join VolaPlace today</p>

        {error && (
          <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={handleChange}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
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

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="Volunteer">I am a Volunteer</option>
            <option value="Organization">I am an Organization</option>
          </select>

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
