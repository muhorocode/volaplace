import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const verificationDone = useRef(false);

  // Check if user is logged in on mount - only once
  useEffect(() => {
    if (verificationDone.current) return;
    verificationDone.current = true;
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Verify token is still valid (async, won't block)
        verifyToken(token);
      } catch (e) {
        // Invalid stored user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        // Token invalid, clear storage but don't trigger re-renders
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear token on any auth error (401, 403, 422)
      // 422 happens when token format is invalid
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 422) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { user, message } = response.data;
      
      // Store user data
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Note: Session-based auth uses cookies, so no token storage needed
      // But we keep token for backward compatibility
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }

      return { success: true, user, message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);

      const { user, message } = response.data;

      // Auto-login after registration
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user, message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setCurrentUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    setCurrentUser,
    isAuthenticated: !!user,
    isVolunteer: user?.role === 'volunteer',
    isOrgAdmin: user?.role === 'org_admin',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
