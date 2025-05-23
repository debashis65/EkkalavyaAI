import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginSimple() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if ((email === "coach@example.com" || email === "athlete@example.com") && password === "password123") {
      const isCoach = email === "coach@example.com";
      const user = {
        id: isCoach ? 1 : 2,
        name: isCoach ? "Guru Drona" : "Arjun Sharma",
        email: email,
        role: isCoach ? "coach" : "athlete"
      };

      localStorage.setItem("ekalavya_user", JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });

      // Direct navigation
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-green-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            E
          </div>
          <CardTitle className="text-2xl font-bold">Ekalavya</CardTitle>
          <p className="text-gray-600">Sports Training & Mentorship Platform</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Demo Accounts:</p>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail("coach@example.com");
                  setPassword("password123");
                }}
              >
                Coach Login
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail("athlete@example.com");
                  setPassword("password123");
                }}
              >
                Athlete Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}