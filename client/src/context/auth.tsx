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

const mockUsers = [
  {
    id: '1',
    username: 'coach@example.com',
    email: 'coach@example.com',
    password: 'password123',
    role: 'coach' as const,
    name: 'Guru Drona',
    twoFactorEnabled: true
  },
  {
    id: '2',
    username: 'athlete@example.com',
    email: 'athlete@example.com',
    password: 'password123',
    role: 'athlete' as const,
    name: 'Arjuna',
    twoFactorEnabled: false
  }
];

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
    
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      
      if (foundUser.twoFactorEnabled) {
        setPendingUser(userWithoutPassword);
        setIsLoading(false);
        return { success: true, requiresTwoFactor: true };
      } else {
        setUser(userWithoutPassword);
        setIsLoading(false);
        return { success: true, requiresTwoFactor: false };
      }
    }

    setIsLoading(false);
    return { success: false, requiresTwoFactor: false };
  };

  const verifyTwoFactor = async (code: string) => {
    if (pendingUser && code === '123456') {
      setUser(pendingUser);
      setPendingUser(null);
      return true;
    }
    return false;
  };

  const logout = () => {
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