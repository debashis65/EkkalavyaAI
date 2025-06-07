import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginImproved() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth(); // Use the auth context
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    try {
      // Simple hardcoded authentication for demo
      if ((data.email === "coach@example.com" || data.email === "athlete@example.com") && 
          data.password === "password123") {
        
        // Determine if coach or athlete
        const isCoach = data.email === "coach@example.com";
        
        // Create a user object that matches AuthContext interface
        const user = {
          id: isCoach ? "1" : "2", // String IDs to match auth context
          name: isCoach ? "Guru Drona" : "Arjun Sharma",
          email: data.email,
          role: isCoach ? "coach" as const : "athlete" as const,
          sports: ["archery"],
          rating: isCoach ? 4.9 : undefined,
          students: isCoach ? 48 : undefined,
          bio: isCoach 
            ? "Elite archery coach with over 15 years of experience." 
            : "Passionate about improving my archery skills.",
          experience: isCoach ? "15+ Years" : undefined,
          achievements: isCoach 
            ? ["National Coach Award 2020"] 
            : ["Regional Gold Medal 2022"],
          twoFactorEnabled: false // For this demo
        };
        
        // If remember me is checked, store this preference
        if (data.rememberMe) {
          localStorage.setItem("ekalavya_remember", "true");
        } else {
          localStorage.removeItem("ekalavya_remember");
        }
        
        // Use the auth context to set the user (this will handle localStorage sync)
        setUser(user);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        // Navigate to dashboard - let React Router handle this properly
        navigate("/", { replace: true });
        
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please check your credentials and try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Pre-filled demo accounts for easy testing
  const loginAsDemoCoach = () => {
    form.setValue("email", "coach@example.com");
    form.setValue("password", "password123");
    form.setValue("rememberMe", true);
  };

  const loginAsDemoAthlete = () => {
    form.setValue("email", "athlete@example.com");
    form.setValue("password", "password123");
    form.setValue("rememberMe", true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center text-2xl mb-4">
          E
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Ekalavya</h1>
        <p className="text-muted-foreground">Sports Training & Mentorship Platform</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <p className="text-muted-foreground text-center text-sm mt-1">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </span>
                        <Input className="pl-10" placeholder="Enter your email" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <Input 
                          className="pl-10" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  )}
                />
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : "Sign in"}
              </Button>
              
              <div className="relative mt-6 pt-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Demo accounts
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={loginAsDemoCoach} type="button" className="flex-1">
                  <span className="mr-2">👨‍🏫</span>Coach Login
                </Button>
                <Button variant="outline" size="sm" onClick={loginAsDemoAthlete} type="button" className="flex-1">
                  <span className="mr-2">🏹</span>Athlete Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-center text-sm text-muted-foreground">
            New to Ekalavya?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}