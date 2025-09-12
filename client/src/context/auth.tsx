import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username?: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
  twoFactorEnabled?: boolean;
  // Additional fields from login
  sports?: string[];
  rating?: number;
  students?: number;
  bio?: string;
  experience?: string;
  achievements?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean; // Added missing property
  login: (username: string, password: string) => Promise<{ success: boolean; requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  pendingUser: User | null;
  setUser: (user: User | null) => void; // Added for direct user setting
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API endpoints for authentication
const API_BASE = '/api';
const LOGIN_ENDPOINT = `${API_BASE}/auth/login`;
const VERIFY_2FA_ENDPOINT = `${API_BASE}/auth/verify-2fa`;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ekalavya_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("ekalavya_user");
      }
    }
  }, []);

  // Sync user changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("ekalavya_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ekalavya_user");
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiCall(LOGIN_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.success) {
        if (response.requiresTwoFactor) {
          setPendingUser(response.user);
          setIsLoading(false);
          return { success: true, requiresTwoFactor: true };
        } else {
          setUser(response.user);
          setIsLoading(false);
          return { success: true, requiresTwoFactor: false };
        }
      }
      
      setIsLoading(false);
      return { success: false, requiresTwoFactor: false };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, requiresTwoFactor: false };
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      if (pendingUser) {
        const response = await apiCall(VERIFY_2FA_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({ userId: pendingUser.id, code }),
        });
        
        if (response.success) {
          setUser(pendingUser);
          setPendingUser(null);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
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
    setPendingUser(null);
    localStorage.removeItem("ekalavya_user");
    localStorage.removeItem("ekalavya_remember");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      verifyTwoFactor,
      logout,
      isLoading,
      pendingUser,
      setUser
    }}>
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