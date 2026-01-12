import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreateProject = ({ onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    geofenceRadius: 100, // default 100 meters
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'geofenceRadius' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const projectData = {
        name: formData.name,
        description: formData.description,
        lat: parseFloat(formData.latitude),
        lon: parseFloat(formData.longitude),
        geofence_radius: formData.geofenceRadius,
        user_id: user.id
      };

      const response = await axios.post(
        `${API_URL}/api/projects`,
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        alert('Project location created successfully!');
        setFormData({
          name: '',
          latitude: '',
          longitude: '',
          geofenceRadius: 100,
          description: ''
        });
        
        if (onProjectCreated) {
          onProjectCreated(response.data.project || response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Project Location</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Community Kitchen Downtown"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the project location..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., -1.286389"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 36.817223"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geofence Radius (meters) *
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            name="geofenceRadius"
            value={formData.geofenceRadius}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>50m</span>
            <span>{formData.geofenceRadius}m</span>
            <span>500m</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Project Location'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;