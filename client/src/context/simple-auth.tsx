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
        localStorage.setItem("ekalavya_user", JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
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
          localStorage.setItem("ekalavya_user", JSON.stringify(pendingUser));
          setUser(pendingUser);
          setPendingUser(null);
          setIsLoading(false);
          return true;
        }
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem("ekalavya_user");
    setUser(null);
    setPendingUser(null);
  };

  // Export the generateTOTP function for demo purposes
  (window as any).generateTOTP = generateTOTP;
  (window as any).mockUsers = mockUsers;

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