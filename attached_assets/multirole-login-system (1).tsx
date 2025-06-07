import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { User, Shield, Settings, BarChart3, Users, LogOut, Eye, EyeOff, Key, Home, UserCircle, Smartphone, RefreshCw } from 'lucide-react';

// Mock React Router implementation (simplified for demo)
interface RouteProps {
  path: string;
  element: React.ReactElement;
}

interface RouterProps {
  children: ReactNode;
}

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

// Simple router context
const RouterContext = createContext<{
  currentPath: string;
  navigate: (path: string) => void;
}>({
  currentPath: '/',
  navigate: () => {}
});

const Router: React.FC<RouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');
  
  const navigate = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const Routes: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentPath } = useContext(RouterContext);
  
  const routes = React.Children.toArray(children) as React.ReactElement<RouteProps>[];
  const activeRoute = routes.find(route => route.props.path === currentPath);
  
  return activeRoute ? activeRoute.props.element : null;
};

const Route: React.FC<RouteProps> = () => null;

const Link: React.FC<LinkProps> = ({ to, children, className = '' }) => {
  const { navigate } = useContext(RouterContext);
  
  return (
    <button
      onClick={() => navigate(to)}
      className={className}
    >
      {children}
    </button>
  );
};

const useNavigate = () => {
  const { navigate } = useContext(RouterContext);
  return navigate;
};

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  pendingUser: User | null;
}

// Mock user database with 2FA secrets
const mockUsers: (User & { password: string; twoFactorSecret: string })[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@company.com',
    role: 'admin',
    name: 'John Admin',
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP' // Base32 encoded secret
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    email: 'manager@company.com',
    role: 'manager',
    name: 'Sarah Manager',
    twoFactorEnabled: true,
    twoFactorSecret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ'
  },
  {
    id: '3',
    username: 'user',
    password: 'user123',
    email: 'user@company.com',
    role: 'user',
    name: 'Mike User',
    twoFactorEnabled: false,
    twoFactorSecret: ''
  }
];

// Simple TOTP implementation for demo
const generateTOTP = (secret: string, timeStep: number = 30): string => {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  // Simplified TOTP - in real app, use proper crypto library
  const hash = (time + secret).split('').reduce((a, b) => {
    a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
    return a < 0 ? a + 0x100000000 : a;
  }, 0);
  return String(hash).slice(-6).padStart(6, '0');
};

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<{ success: boolean; requiresTwoFactor: boolean }> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, twoFactorSecret, ...userWithoutPassword } = foundUser;
      
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

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (pendingUser) {
      const foundUser = mockUsers.find(u => u.id === pendingUser.id);
      if (foundUser) {
        const validCode = generateTOTP(foundUser.twoFactorSecret);
        if (code === validCode) {
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
    setUser(null);
    setPendingUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyTwoFactor, logout, isLoading, pendingUser }}>
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
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(username, password);
    if (result.success) {
      if (result.requiresTwoFactor) {
        navigate('/2fa');
      } else {
        navigate('/dashboard');
      }
    } else {
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
          <p className="mt-2 text-sm text-gray-600">Multi-role authentication with 2FA</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs">
            <button 
              onClick={() => fillCredentials('admin')}
              className="block w-full text-left text-blue-600 hover:text-blue-800"
            >
              Admin: admin / admin123 (2FA enabled)
            </button>
            <button 
              onClick={() => fillCredentials('manager')}
              className="block w-full text-left text-green-600 hover:text-green-800"
            >
              Manager: manager / manager123 (2FA enabled)
            </button>
            <button 
              onClick={() => fillCredentials('user')}
              className="block w-full text-left text-purple-600 hover:text-purple-800"
            >
              User: user / user123 (No 2FA)
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

// Two Factor Authentication Component
const TwoFactorAuth: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const { verifyTwoFactor, isLoading, pendingUser } = useAuth();
  const navigate = useNavigate();

  // Generate current TOTP code for demo
  useEffect(() => {
    if (pendingUser) {
      const foundUser = mockUsers.find(u => u.id === pendingUser.id);
      if (foundUser && foundUser.twoFactorSecret) {
        const updateCode = () => {
          const newCode = generateTOTP(foundUser.twoFactorSecret);
          setCurrentCode(newCode);
          setTimeLeft(30 - (Math.floor(Date.now() / 1000) % 30));
        };
        
        updateCode();
        const interval = setInterval(updateCode, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [pendingUser]);

  const handleSubmit = async () => {
    setError('');
    
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    const success = await verifyTwoFactor(code);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid verification code');
      setCode('');
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  if (!pendingUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Demo code display */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Demo Code (Auto-Generated)</span>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-800 mb-2">
            {currentCode}
          </div>
          <div className="flex items-center justify-center space-x-1">
            <RefreshCw className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-blue-600">Refreshes in {timeLeft}s</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg font-mono"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || code.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation component
const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { currentPath } = useContext(RouterContext);

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  // Add admin-only navigation
  if (user.role === 'admin') {
    navItems.push(
      { path: '/users', icon: Users, label: 'Users' },
      { path: '/settings', icon: Settings, label: 'Settings' }
    );
  }

  // Add manager navigation
  if (user.role === 'manager') {
    navItems.push({ path: '/team', icon: Users, label: 'Team' });
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
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

// Page Components
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

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

  return renderDashboard();
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-sm text-gray-900">{user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
          <p className="mt-1 text-sm text-gray-900">
            {user.twoFactorEnabled ? (
              <span className="text-green-600">Enabled</span>
            ) : (
              <span className="text-red-600">Disabled</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
      <p className="text-gray-600">Manage all system users and their permissions.</p>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
      <p className="text-gray-600">Configure system-wide settings and preferences.</p>
    </div>
  );
};

const TeamPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Management</h3>
      <p className="text-gray-600">Manage your team members and assignments.</p>
    </div>
  );
};

// Main Layout Component
const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SecureApp</h1>
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
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/dashboard" element={<Layout />} />
          <Route path="/profile" element={<Layout />} />
          <Route path="/users" element={<Layout />} />
          <Route path="/settings" element={<Layout />} />
          <Route path="/team" element={<Layout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;