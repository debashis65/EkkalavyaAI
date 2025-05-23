import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
  sports?: string[];
  rating?: number;
  students?: number;
  bio?: string;
  experience?: string;
  achievements?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ekalavya_user");
    localStorage.removeItem("ekalavya_remember");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      setUser,
      logout
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