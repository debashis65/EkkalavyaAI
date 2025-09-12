import React, { useState, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'coach' | 'athlete';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// API endpoints for authentication
const API_BASE = '/api';
const LOGIN_ENDPOINT = `${API_BASE}/auth/login`;
const LOGOUT_ENDPOINT = `${API_BASE}/auth/logout`;

// API utility function
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
export const EkalavyaAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiCall(LOGIN_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiCall(LOGOUT_ENDPOINT, { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useEkalavyaAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEkalavyaAuth must be used within an EkalavyaAuthProvider');
  }
  return context;
};