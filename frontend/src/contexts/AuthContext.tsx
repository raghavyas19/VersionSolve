import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../utils/api';
import { clearUserData, handleReload, initializeMemoryManagement } from '../utils/memoryManager';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null | { unverified: boolean; email: string; error: string }>;
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
          const userData = response.data.user || null;
          setUser(userData);
          
          // Handle reload for authenticated user
          if (userData) {
            await handleReload(userData.id || userData._id);
            // Initialize memory management for authenticated user
            initializeMemoryManagement(userData.id || userData._id);
          }
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
          // Clear any potential user data on token verification failure
          clearUserData();
        } finally {
          setIsLoading(false);
        }
      };
      verifyToken();
    } else {
      setIsLoading(false);
      // Handle reload for guest user
      handleReload();
      // Initialize memory management for guest user
      initializeMemoryManagement();
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null | { unverified: boolean; email: string; error: string }> => {
    try {
      const response = await api.post('/auth/login', { username: email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      const verifyResponse = await api.get('/auth/verify');
      const userData = verifyResponse.data.user || null;
      setUser(userData);
      
      // Handle reload for newly logged in user
      if (userData) {
        await handleReload(userData.id || userData._id);
        // Initialize memory management for newly logged in user
        initializeMemoryManagement(userData.id || userData._id);
      }
      
      return userData;
    } catch (err: any) {
      if (err.response?.data?.unverified && err.response?.data?.email) {
        return {
          unverified: true,
          email: err.response.data.email,
          error: err.response.data.error || 'Your email is not verified.'
        };
      }
      return null;
    }
  };

  const logout = () => {
    const userId = user?.id || user?._id;
    
    // Clear all user-specific data before logging out
    clearUserData(userId);
    
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