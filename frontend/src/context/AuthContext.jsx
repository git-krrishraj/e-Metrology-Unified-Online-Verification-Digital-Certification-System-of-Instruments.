import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  admin: { email: 'admin@metrology.gov.in', password: 'Admin@1234', label: 'Admin (Directorate HQ)' },
  lmo: { email: 'lmo.mumbai@metrology.gov.in', password: 'Officer@1234', label: 'Legal Metrology Officer (Mumbai)' },
  gatc: { email: 'gatc.central@metrology.gov.in', password: 'Gatc@1234', label: 'GATC Regional Test Centre' },
  consumer: { email: 'retailer.rajesh@gmail.com', password: 'Owner@1234', label: 'Retailer (Rajesh Supermarket)' },
  weighbridge: { email: 'industrial.steel@gmail.com', password: 'Owner@1234', label: 'Industrial Weighbridge Operator' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session verify failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  const quickLogin = async (roleKey) => {
    const creds = DEMO_USERS[roleKey];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, quickLogin, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
