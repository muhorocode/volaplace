import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileUpdate = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    mpesa_phone: '',
    role: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err) {
      toast.error('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone format
    const phoneRegex = /^254\d{9}$/;
    if (!phoneRegex.test(profile.phone)) {
      toast.error('Phone must be in format 254XXXXXXXXX (e.g., 254712345678)');
      return;
    }

    if (profile.mpesa_phone && !phoneRegex.test(profile.mpesa_phone)) {
      toast.error('M-Pesa phone must be in format 254XXXXXXXXX');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        {
          name: profile.name,
          phone: profile.phone,
          mpesa_phone: profile.mpesa_phone
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      toast.success('Profile updated successfully!');
      setProfile(response.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="254712345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: 254XXXXXXXXX (Kenyan mobile number)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            M-Pesa Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={profile.mpesa_phone || ''}
            onChange={(e) => setProfile({ ...profile, mpesa_phone: e.target.value })}
            placeholder="254712345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for receiving payments. Leave blank to use main phone number.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <input
            type="text"
            value={profile.role}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 capitalize"
            disabled
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;
