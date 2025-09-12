import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, Sport } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  pendingUser: User | null;
}

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

// TOTP generation now handled by backend

const SimpleAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ekalavya_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("ekalavya_user");
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; requiresTwoFactor: boolean }> => {
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
          localStorage.setItem("ekalavya_user", JSON.stringify(response.user));
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

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (pendingUser) {
        const response = await apiCall(VERIFY_2FA_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({ userId: pendingUser.id, code }),
        });
        
        if (response.success) {
          localStorage.setItem("ekalavya_user", JSON.stringify(pendingUser));
          setUser(pendingUser);
          setPendingUser(null);
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
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
    
    localStorage.removeItem("ekalavya_user");
    setUser(null);
    setPendingUser(null);
  };

  // Remove demo window exports for production

  return (
    <SimpleAuthContext.Provider value={{ 
      user, 
      login, 
      verifyTwoFactor, 
      logout, 
      isLoading, 
      pendingUser 
    }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};