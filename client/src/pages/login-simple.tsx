import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// Demo accounts
const DEMO_ACCOUNTS = {
  "coach@example.com": {
    password: "password123",
    user: {
      id: "1",
      email: "coach@example.com",
      role: "coach" as const,
      name: "Guru Drona"
    }
  },
  "athlete@example.com": {
    password: "password123", 
    user: {
      id: "2",
      email: "athlete@example.com", 
      role: "athlete" as const,
      name: "Arjuna"
    }
  }
};

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface LoginProps {
  setUser: (user: User | null) => void;
}

export default function LoginSimple({ setUser }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Registration form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<'coach' | 'athlete'>('athlete');
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const account = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    
    if (account && account.password === password) {
      // Store user in localStorage
      localStorage.setItem("ekalavya_user", JSON.stringify(account.user));
      
      // Set user in parent component
      setUser(account.user);
    } else {
      setError("Invalid email or password");
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create new user account
    const newUser = {
      id: Date.now().toString(),
      email: regEmail,
      role: regRole,
      name: regName
    };

    // Store user in localStorage
    localStorage.setItem("ekalavya_user", JSON.stringify(newUser));
    
    // Set user in parent component
    setUser(newUser);
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Show success message
    alert(`Password reset instructions have been sent to ${forgotEmail}`);
    setCurrentView('login');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/logo.jpeg" 
            alt="Ekalavya AI Logo" 
            className="w-20 h-20 mx-auto mb-4 object-contain rounded-lg"
          />
          <CardTitle className="text-2xl font-bold">
            {currentView === 'login' && 'Welcome to Ekalavya'}
            {currentView === 'register' && 'Join Ekalavya'}
            {currentView === 'forgot' && 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {currentView === 'login' && 'Sign in to your sports training platform'}
            {currentView === 'register' && 'Create your account'}
            {currentView === 'forgot' && 'Enter your email to reset password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Login Form */}
          {currentView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-4 text-center space-y-2">
              <button 
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => setCurrentView('forgot')}
              >
                Forgot Password?
              </button>
              <div className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  type="button"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  onClick={() => setCurrentView('register')}
                >
                  Sign up here
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">Demo Accounts:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Coach: coach@example.com / password123</div>
                <div>Athlete: athlete@example.com / password123</div>
              </div>
            </div>
          </form>
          )}

          {/* Registration Form */}
          {currentView === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-role">I am a</Label>
                <select 
                  id="reg-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as 'coach' | 'athlete')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="athlete">Athlete</option>
                  <option value="coach">Coach</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="mt-4 text-center">
                <button 
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => setCurrentView('login')}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {currentView === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>

              <div className="mt-4 text-center">
                <button 
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => setCurrentView('login')}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}