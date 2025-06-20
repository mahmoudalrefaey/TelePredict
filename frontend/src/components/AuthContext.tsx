import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userType: string | null;
  login: (token: string, userType: string, userId: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType');
    let displayName = localStorage.getItem('username');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        if (storedUserType === 'client' && decoded.company_name) {
          displayName = decoded.company_name;
        } else if (storedUserType === 'staff' && decoded.name) {
          displayName = decoded.name;
        }
        setIsAuthenticated(true);
        setUserType(storedUserType);
      } else {
        setIsAuthenticated(false);
        setUserType(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
    setUsername(displayName);
  }, []);

  const login = (token: string, userType: string, userId: string, username: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUserType(userType);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserType(null);
    setUsername(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 