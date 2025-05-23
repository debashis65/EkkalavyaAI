import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function LoginSimple() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Reload the page to trigger the app's user check
      window.location.reload();
    } else {
      setError("Invalid email or password");
    }
    
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
          <CardTitle className="text-2xl font-bold">Welcome to Ekalavya</CardTitle>
          <CardDescription>
            Sign in to your sports training platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
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
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Coach: coach@example.com / password123</div>
              <div>Athlete: athlete@example.com / password123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}