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

// Mock user database
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    username: 'coach',
    password: 'password123',
    email: 'coach@example.com',
    role: 'coach',
    name: 'Guru Drona'
  },
  {
    id: '2',
    username: 'athlete',
    password: 'password123',
    email: 'athlete@example.com',
    role: 'athlete',
    name: 'Arjun Sharma'
  }
];

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
export const EkalavyaAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
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