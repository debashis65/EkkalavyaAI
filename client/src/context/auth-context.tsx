import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole, Sport } from "@/types";

// Default values for the auth context
const defaultAuthContext = {
  user: null as User | null,
  isAuthenticated: false,
  login: async (_username: string, _password: string) => ({ success: false, requiresTwoFactor: false }),
  verifyTwoFactor: async (_code: string) => false,
  register: async (_name: string, _email: string, _password: string, _role: UserRole) => {},
  logout: () => {},
  isLoading: false,
  pendingUser: null as User | null,
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  pendingUser: User | null;
}

// Create a context with default values
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user database for Ekalavya with 2FA
const mockUsers: (User & { password: string; username: string; twoFactorSecret: string })[] = [
  {
    id: 1,
    username: 'coach',
    password: 'password123',
    name: "Guru Drona",
    email: "coach@example.com",
    role: "coach",
    sports: ["archery" as Sport],
    rating: 4.9,
    students: 48,
    bio: "Elite archery coach with over 15 years of experience training national and international champions.",
    experience: "15+ Years Experience",
    achievements: ["National Coach Award 2020", "Olympic Medal Coach 2016"],
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP'
  },
  {
    id: 2,
    username: 'athlete',
    password: 'password123',
    name: "Arjun Sharma",
    email: "athlete@example.com",
    role: "athlete",
    sports: ["archery" as Sport],
    bio: "Passionate about improving my archery skills and reaching new heights in my sporting journey.",
    achievements: ["Regional Gold Medal 2022", "National Bronze 2023"],
    twoFactorEnabled: false,
    twoFactorSecret: ''
  },
  {
    id: 3,
    username: 'admin',
    password: 'admin123',
    name: "Admin User",
    email: "admin@ekalavya.com",
    role: "admin",
    sports: ["archery" as Sport],
    twoFactorEnabled: true,
    twoFactorSecret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'
  }
];

// Simple TOTP implementation for demo
const generateTOTP = (secret: string, timeStep: number = 30): string => {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const hash = (time + secret).split('').reduce((a, b) => {
    a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
    return a < 0 ? a + 0x100000000 : a;
  }, 0);
  return String(hash).slice(-6).padStart(6, '0');
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ekalavya_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("ekalavya_user");
      }
    }
  }, []);
  
  const navigate = useNavigate();

  const login = async (username: string, password: string): Promise<{ success: boolean; requiresTwoFactor: boolean }> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(u => 
      (u.username === username || u.email === username) && u.password === password
    );
    
    if (foundUser) {
      const { password: _, twoFactorSecret, username: __, ...userWithoutPassword } = foundUser;
      
      if (foundUser.twoFactorEnabled) {
        setPendingUser(userWithoutPassword);
        setIsLoading(false);
        return { success: true, requiresTwoFactor: true };
      } else {
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem("ekalavya_user", JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return { success: true, requiresTwoFactor: false };
      }
    }
    
    setIsLoading(false);
    return { success: false, requiresTwoFactor: false };
  };

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (pendingUser) {
      const foundUser = mockUsers.find(u => u.id === pendingUser.id);
      if (foundUser) {
        const validCode = generateTOTP(foundUser.twoFactorSecret);
        if (code === validCode) {
          setUser(pendingUser);
          setIsAuthenticated(true);
          localStorage.setItem("ekalavya_user", JSON.stringify(pendingUser));
          setPendingUser(null);
          setIsLoading(false);
          return true;
        }
      }
    }
    
    setIsLoading(false);
    return false;
  };
  
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      // Create a new user with the provided details
      const newUser: User = {
        id: 3, // In a real app, this would be generated by the backend
        name,
        email,
        role,
        sports: ["archery" as Sport],
        rating: role === "coach" ? 4.5 : undefined,
        students: role === "coach" ? 0 : undefined,
      };
      
      // Save user data to state and localStorage
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("ekalavya_user", JSON.stringify(newUser));
      
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPendingUser(null);
    localStorage.removeItem("ekalavya_user");
    navigate("/login");
  };

  // Export the generateTOTP function for demo purposes
  (window as any).generateTOTP = generateTOTP;
  (window as any).mockUsers = mockUsers;
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      verifyTwoFactor, 
      register, 
      logout, 
      isLoading, 
      pendingUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
