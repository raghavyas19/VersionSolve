import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (contact: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await api.get('/auth/verify');
          setUser(response.data.user || null); // Ensure user is set even if response.data.user is undefined
        } catch (err) {
          console.error('Token verification error:', err);
          localStorage.removeItem('token');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (contact: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { username: contact, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const verifyResponse = await api.get('/auth/verify');
      setUser(verifyResponse.data.user || null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setRedirectPath(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, redirectPath, setRedirectPath, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};