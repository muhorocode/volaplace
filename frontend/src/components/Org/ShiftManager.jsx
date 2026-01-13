import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ShiftManager = ({ projects }) => {
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shift_date: '',
    start_time: '09:00',
    end_time: '13:00',
    required_volunteers: 5,
    project_id: '',
    base_stipend: 500,
    bonus_per_beneficiary: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !formData.project_id) {
      setFormData(prev => ({ ...prev, project_id: projects[0].id }));
    }
    fetchShifts();
  }, [projects]);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      // Get all shifts - backend should filter appropriately
      const response = await axios.get(
        `${API_URL}/api/shifts`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setShifts(response.data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift({
      id: shift.id,
      title: shift.title,
      description: shift.description || '',
      shift_date: shift.shift_date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      required_volunteers: shift.required_volunteers,
      base_stipend: shift.base_stipend || 500,
      bonus_per_beneficiary: shift.bonus_per_beneficiary || 50
    });
    setShowEditModal(true);
  };

  const handleUpdateShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/shifts/${editingShift.id}`,
        editingShift,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Shift updated successfully!');
        setShowEditModal(false);
        setEditingShift(null);
        fetchShifts();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/api/shifts/${shiftId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Shift deleted successfully!');
        fetchShifts();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete shift');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/shifts`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Shift created successfully!');
        setFormData({
          title: '',
          description: '',
          shift_date: '',
          start_time: '09:00',
          end_time: '13:00',
          required_volunteers: 5,
          project_id: projects[0]?.id || '',
          base_stipend: 500,
          bonus_per_beneficiary: 50
        });
        fetchShifts();
      }
    } catch (err) {
      console.error('Error creating shift:', err);
      toast.error(err.response?.data?.error || 'Failed to create shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Shift Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Shift</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Food Distribution Morning Shift"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Location *
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe the shift duties..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.shift_date}
                onChange={(e) => setFormData({...formData, shift_date: e.target.value})}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volunteers Needed *
              </label>
              <input
                type="number"
                min="1"
                value={formData.required_volunteers}
                onChange={(e) => setFormData({...formData, required_volunteers: parseInt(e.target.value)})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Stipend (KES)
              </label>
              <input
                type="number"
                min="0"
                value={formData.base_stipend}
                onChange={(e) => setFormData({...formData, base_stipend: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus per Beneficiary (KES)
              </label>
              <input
                type="number"
                min="0"
                value={formData.bonus_per_beneficiary}
                onChange={(e) => setFormData({...formData, bonus_per_beneficiary: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Shift'}
          </button>
        </form>
      </div>

      {/* Existing Shifts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Shifts</h2>
        {shifts.length === 0 ? (
          <p className="text-gray-500">No shifts created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volunteers</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shifts.map(shift => (
                  <tr key={shift.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{shift.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(shift.shift_date).toLocaleDateString()}<br/>
                      {shift.start_time} - {shift.end_time}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {shift.volunteers_signed_up}/{shift.required_volunteers}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        shift.status === 'active' ? 'bg-green-100 text-green-800' :
                        shift.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button 
                        onClick={() => handleEditShift(shift)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteShift(shift.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Shift Modal */}
      {showEditModal && editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Shift</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingShift.title}
                  onChange={(e) => setEditingShift({...editingShift, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingShift.description}
                  onChange={(e) => setEditingShift({...editingShift, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingShift.shift_date}
                    onChange={(e) => setEditingShift({...editingShift, shift_date: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingShift.start_time}
                    onChange={(e) => setEditingShift({...editingShift, start_time: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingShift.end_time}
                    onChange={(e) => setEditingShift({...editingShift, end_time: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volunteers Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={editingShift.required_volunteers}
                    onChange={(e) => setEditingShift({...editingShift, required_volunteers: parseInt(e.target.value)})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Stipend (KES)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingShift.base_stipend}
                    onChange={(e) => setEditingShift({...editingShift, base_stipend: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus/Beneficiary</label>
                  <input
                    type="number"
                    min="0"
                    value={editingShift.bonus_per_beneficiary}
                    onChange={(e) => setEditingShift({...editingShift, bonus_per_beneficiary: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManager;