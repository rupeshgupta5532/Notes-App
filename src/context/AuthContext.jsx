import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN_USER = {
  userId: 'admin_sys_01',
  name: 'Rupesh Gupta (Admin)',
  email: 'admin@company.com',
  role: 'ADMIN',
  department: 'Platform Engineering',
};

export const DEFAULT_TOKEN = 'admin-secure-token-session-01';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const isLoggedOut = localStorage.getItem('is_logged_out') === 'true';
      if (isLoggedOut) return null;
      const stored = localStorage.getItem('user') || localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : DEFAULT_ADMIN_USER;
    } catch {
      return DEFAULT_ADMIN_USER;
    }
  });

  const [token, setToken] = useState(() => {
    const isLoggedOut = localStorage.getItem('is_logged_out') === 'true';
    if (isLoggedOut) return null;
    return localStorage.getItem('token') || localStorage.getItem('admin_token') || DEFAULT_TOKEN;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.removeItem('is_logged_out');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('admin_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('admin_token', token);
      localStorage.removeItem('is_logged_out');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.removeItem('is_logged_out');
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.setItem('is_logged_out', 'true');
    setUser(null);
    setToken(null);
  };

  const role = user?.role || 'EMPLOYEE';
  const isAdmin = role === 'ADMIN';
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isAuthenticated,
        login,
        logout,
      }}
    >
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

export default AuthContext;
