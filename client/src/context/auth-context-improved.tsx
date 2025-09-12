import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole, Sport } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Storage keys
const USER_STORAGE_KEY = "ekalavya_user";
const TOKEN_STORAGE_KEY = "ekalavya_token";
const REMEMBER_ME_KEY = "ekalavya_remember";

// Default values for the auth context
const defaultAuthContext = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  login: async (_email: string, _password: string, _rememberMe: boolean = false): Promise<boolean> => false,
  register: async (_name: string, _email: string, _password: string, _role: UserRole): Promise<boolean> => false,
  logout: () => {},
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

// Create a context with default values
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// API endpoints for authentication
const API_BASE = '/api';
const LOGIN_ENDPOINT = `${API_BASE}/auth/login`;
const REGISTER_ENDPOINT = `${API_BASE}/auth/register`;
const USER_ENDPOINT = `${API_BASE}/auth/user`;
const LOGOUT_ENDPOINT = `${API_BASE}/auth/logout`;

// API utility functions
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Include cookies for session management
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();
  
  // Initialize state based on localStorage
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Check localStorage on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear potentially corrupted data
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Make API call to backend authentication endpoint
      const response = await apiCall(LOGIN_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      if (!response.success || !response.user) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: response.message || "Invalid email or password. Please try again.",
        });
        return false;
      }
      
      const userData = response.user;
      
      // Save authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist to localStorage based on rememberMe preference
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        }
      } else {
        // Session-only login, clear persistent storage
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Make API call to backend registration endpoint
      const response = await apiCall(REGISTER_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (!response.success || !response.user) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: response.message || "Registration failed. Please try again.",
        });
        return false;
      }
      
      const userData = response.user;
      
      // Save authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist to localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      if (response.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome to Ekalavya, ${userData.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate session
      await apiCall(LOGOUT_ENDPOINT, { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API fails
    }
    
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear auth data from localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate("/login");
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading,
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}