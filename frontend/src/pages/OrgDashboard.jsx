import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import CreateProject from '../components/Org/CreateProject';
import ShiftManager from '../components/Org/ShiftManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OrgDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectShifts, setProjectShifts] = useState([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is organization admin
    if (!user || user.role !== 'org_admin') {
      navigate('/');
      return;
    }
    
    fetchProjects();
  }, [navigate, user]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // For now, get all projects - backend should filter by org
      const response = await axios.get(
        `${API_URL}/api/projects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setProjects(response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setActiveTab('projects'); // Navigate to Project Locations tab
    toast.success('Project location created successfully!');
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_URL}/api/projects/${projectId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully');
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error(err.response?.data?.error || 'Failed to delete project');
      }
    }
  };

  const handleViewShifts = async (project) => {
    setSelectedProject(project);
    setShiftsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/api/shifts?project_id=${project.id}`;
      const response = await axios.get(
        url,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setProjectShifts(response.data || []);
    } catch (err) {
      toast.error('Failed to load shifts');
      setProjectShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  };

  const closeShiftsModal = () => {
    setSelectedProject(null);
    setProjectShifts([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Organization Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your projects and volunteer shifts
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Locations
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create New Project
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Shifts
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'projects' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects yet. Create your first project!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            📍 {project.lat?.toFixed(6)}, {project.lon?.toFixed(6)}
                          </span>
                          <span>
                            ⭕ Geofence: {project.geofence_radius}m
                          </span>
                          <span>
                            📅 Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleViewShifts(project)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          View Shifts
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <CreateProject onProjectCreated={handleProjectCreated} />
        )}

        {activeTab === 'shifts' && (
          <ShiftManager projects={projects} />
        )}
      </main>

      {/* View Shifts Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Shifts for {selectedProject.name}
                </h3>
                <p className="text-sm text-gray-500">
                  🆔 Project ID: {selectedProject.id} | 📍 {selectedProject.lat?.toFixed(4)}, {selectedProject.lon?.toFixed(4)}
                </p>
              </div>
              <button 
                onClick={closeShiftsModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {shiftsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading shifts...</p>
                </div>
              ) : projectShifts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No shifts created for this project yet.</p>
                  <button
                    onClick={() => {
                      closeShiftsModal();
                      setActiveTab('shifts');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create a Shift
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectShifts.map(shift => (
                    <div key={shift.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{shift.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{shift.description || 'No description'}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                            <span>🆔 Shift ID: {shift.id} | Project ID: {shift.project_id}</span>
                            <span>📅 {shift.date ? new Date(shift.date).toLocaleDateString() : 'TBD'}</span>
                            <span>🕐 {shift.start_time} - {shift.end_time}</span>
                            <span>👥 {shift.volunteers_signed_up || 0}/{shift.max_volunteers} volunteers</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              shift.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                              shift.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shift.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeShiftsModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeShiftsModal();
                  setActiveTab('shifts');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage All Shifts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;