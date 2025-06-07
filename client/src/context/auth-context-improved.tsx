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

// Create mock users for demonstration
const mockUsers = [
  {
    id: 1,
    name: "Guru Drona",
    email: "coach@example.com",
    password: "password123", // In a real app, this would be hashed and stored on the server
    role: "coach" as UserRole,
    sports: ["archery" as Sport],
    rating: 4.9,
    students: 48,
    bio: "Elite archery coach with over 15 years of experience training national and international champions.",
    experience: "15+ Years Experience",
    achievements: ["National Coach Award 2020", "Olympic Medal Coach 2016"]
  },
  {
    id: 2,
    name: "Arjun Sharma",
    email: "athlete@example.com",
    password: "password123", // In a real app, this would be hashed and stored on the server
    role: "athlete" as UserRole,
    sports: ["archery" as Sport],
    bio: "Passionate about improving my archery skills and reaching new heights in my sporting journey.",
    achievements: ["Regional Gold Medal 2022", "National Bronze 2023"]
  }
];

// In-memory storage for registered users during the session
let registeredUsers = [...mockUsers];

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
      
      // Find user with matching credentials
      const foundUser = registeredUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        });
        return false;
      }
      
      // Create a user object without the password
      const { password: _, ...userData } = foundUser;
      
      // Generate a mock token (in a real app, this would come from your backend)
      const mockToken = btoa(`${userData.id}:${userData.email}:${Date.now()}`);
      
      // Save authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist to localStorage if rememberMe is true or previously set
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, "true");
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      } else if (localStorage.getItem(REMEMBER_ME_KEY)) {
        // If remember me was previously set, respect that setting
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      } else {
        // Session-only login, clear localStorage
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
      
      // Check if user already exists
      if (registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "An account with this email already exists.",
        });
        return false;
      }
      
      // Create a new user
      const newUser = {
        id: registeredUsers.length + 1,
        name,
        email,
        password, // In a real app, this would be hashed
        role,
        sports: ["archery" as Sport], // Default sport
        rating: role === "coach" ? 4.5 : undefined,
        students: role === "coach" ? 0 : undefined,
        bio: role === "coach" 
          ? `${name} is a dedicated ${role} specializing in archery.` 
          : `${name} is passionate about improving in archery.`,
        achievements: []
      };
      
      // Add to registered users (in a real app, this would be saved to a database)
      registeredUsers.push(newUser);
      
      // Remove password from user data stored in state
      const { password: _, ...userData } = newUser;
      
      // Generate a mock token
      const mockToken = btoa(`${userData.id}:${userData.email}:${Date.now()}`);
      
      // Save authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist to localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      
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
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear auth data from localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    
    // Don't clear remember me preference unless explicitly requested
    
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