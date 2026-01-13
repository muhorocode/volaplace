import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rules, setRules] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editingRules, setEditingRules] = useState(false);
  const [formData, setFormData] = useState({
    base_hourly_rate: '',
    bonus_per_beneficiary: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all admin data
      const [statsRes, rulesRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard-stats`, { headers }),
        axios.get(`${API_URL}/api/admin/global-rules`, { headers }),
        axios.get(`${API_URL}/api/admin/transactions?per_page=20`, { headers })
      ]);

      setStats(statsRes.data.summary);
      setRules(rulesRes.data.rules);
      setFormData({
        base_hourly_rate: rulesRes.data.rules.base_hourly_rate,
        bonus_per_beneficiary: rulesRes.data.rules.bonus_per_beneficiary
      });
      setTransactions(transactionsRes.data.transactions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRules = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_URL}/api/admin/global-rules`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRules(response.data.rules);
      setSuccess('Payout rules updated successfully!');
      setEditingRules(false);
      
      // Refresh stats after update
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update rules');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform-wide analytics and configuration</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Beneficiaries Served"
            value={stats?.total_beneficiaries || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Paid Out"
            value={`KES ${(stats?.total_paid_out || 0).toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Pending Payouts"
            value={`KES ${(stats?.total_pending_payout || 0).toFixed(2)}`}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Active Volunteers"
            value={stats?.total_volunteers || 0}
            icon="🙋"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Organizations"
            value={stats?.total_organizations || 0}
            icon="🏢"
            color="indigo"
          />
          <StatCard
            title="Project Locations"
            value={stats?.total_projects || 0}
            icon="📍"
            color="pink"
          />
          <StatCard
            title="Active Shifts"
            value={stats?.active_shifts || 0}
            icon="📅"
            color="orange"
          />
        </div>

        {/* Global Payout Rules */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Global Payout Rules</h2>
            {!editingRules && (
              <button
                onClick={() => setEditingRules(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Rules
              </button>
            )}
          </div>

          {editingRules ? (
            <form onSubmit={handleUpdateRules} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Hourly Rate (KES)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_hourly_rate}
                  onChange={(e) => setFormData({ ...formData, base_hourly_rate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Amount paid per hour worked</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus per Beneficiary (KES)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bonus_per_beneficiary}
                  onChange={(e) => setFormData({ ...formData, bonus_per_beneficiary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Bonus amount per person served</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Payout Formula:</p>
                <p className="text-sm text-blue-700">
                  Stipend = (Base Hourly Rate × Hours Worked) + (Bonus per Beneficiary × Beneficiaries Served)
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Example: (KES {formData.base_hourly_rate || 0} × 4 hours) + (KES {formData.bonus_per_beneficiary || 0} × 20 people) = 
                  KES {((parseFloat(formData.base_hourly_rate) || 0) * 4 + (parseFloat(formData.bonus_per_beneficiary) || 0) * 20).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRules(false);
                    setFormData({
                      base_hourly_rate: rules.base_hourly_rate,
                      bonus_per_beneficiary: rules.bonus_per_beneficiary
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Base Hourly Rate</p>
                <p className="text-2xl font-bold text-gray-900">KES {rules?.base_hourly_rate || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Bonus per Beneficiary</p>
                <p className="text-2xl font-bold text-gray-900">KES {rules?.bonus_per_beneficiary || 0}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Reconciliation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Reconciliation</h2>
          <p className="text-gray-600 mb-4">Recent M-Pesa transactions (Last 20)</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volunteer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{t.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{t.volunteer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.phone}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        KES {t.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          t.status === 'completed' ? 'bg-green-100 text-green-800' :
                          t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable stat card component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color] || 'bg-gray-50 text-gray-600'} w-16 h-16 rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
