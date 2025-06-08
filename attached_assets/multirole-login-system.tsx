import React, { useState, createContext, useContext, ReactNode } from 'react';
import { User, Shield, Settings, BarChart3, Users, LogOut, Eye, EyeOff } from 'lucide-react';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Mock user database
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@company.com',
    role: 'admin',
    name: 'John Admin'
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    email: 'manager@company.com',
    role: 'manager',
    name: 'Sarah Manager'
  },
  {
    id: '3',
    username: 'user',
    password: 'user123',
    email: 'user@company.com',
    role: 'user',
    name: 'Mike User'
  }
];

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    
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
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async () => {
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  const fillCredentials = (role: 'admin' | 'manager' | 'user') => {
    setUsername(role);
    setPassword(`${role}123`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Multi-role authentication system</p>
        </div>
        
        {/* Demo credentials */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs">
            <button 
              onClick={() => fillCredentials('admin')}
              className="block w-full text-left text-blue-600 hover:text-blue-800"
            >
              Admin: admin / admin123
            </button>
            <button 
              onClick={() => fillCredentials('manager')}
              className="block w-full text-left text-green-600 hover:text-green-800"
            >
              Manager: manager / manager123
            </button>
            <button 
              onClick={() => fillCredentials('user')}
              className="block w-full text-left text-purple-600 hover:text-purple-800"
            >
              User: user / user123
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Components
const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Dashboard</h3>
        <p className="text-gray-600 mb-4">Welcome to the admin panel. You have full access to all system features.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <Users className="h-8 w-8 text-red-600 mb-2" />
            <h4 className="font-semibold text-red-900">User Management</h4>
            <p className="text-sm text-red-700">Manage all users and permissions</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <Settings className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-blue-900">System Settings</h4>
            <p className="text-sm text-blue-700">Configure system-wide settings</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-semibold text-green-900">Analytics</h4>
            <p className="text-sm text-green-700">View comprehensive reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manager Dashboard</h3>
        <p className="text-gray-600 mb-4">Welcome to the manager panel. You can manage your team and view reports.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-semibold text-green-900">Team Management</h4>
            <p className="text-sm text-green-700">Manage your team members</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-blue-900">Reports</h4>
            <p className="text-sm text-blue-700">View team performance reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Dashboard</h3>
        <p className="text-gray-600 mb-4">Welcome! Here you can view your personal information and tasks.</p>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <User className="h-8 w-8 text-purple-600 mb-2" />
          <h4 className="font-semibold text-purple-900">My Profile</h4>
          <p className="text-sm text-purple-700">View and edit your profile information</p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'user':
        return <UserDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {user.role.toUpperCase()}
              </span>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

const AuthWrapper: React.FC = () => {
  const { user } = useAuth();
  
  return user ? <Dashboard /> : <LoginForm />;
};

export default App;