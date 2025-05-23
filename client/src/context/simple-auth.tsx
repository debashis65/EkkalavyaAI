import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "coach" | "athlete";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ekalavya_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("ekalavya_user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (password === "password123") {
      let userData: User;
      
      if (email === "coach@example.com") {
        userData = {
          id: 1,
          name: "Guru Drona",
          email: "coach@example.com",
          role: "coach"
        };
      } else if (email === "athlete@example.com") {
        userData = {
          id: 2,
          name: "Arjun Sharma", 
          email: "athlete@example.com",
          role: "athlete"
        };
      } else {
        return false;
      }

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("ekalavya_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("ekalavya_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within SimpleAuthProvider");
  }
  return context;
}