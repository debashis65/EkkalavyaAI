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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      // For demo purposes, create a fixed user for each role
      const isCoach = data.email === "coach@example.com";
      
      // Create a user object directly
      const user = {
        id: isCoach ? 1 : 2,
        name: isCoach ? "Guru Drona" : "Arjun Sharma",
        email: data.email,
        role: isCoach ? "coach" : "athlete",
        sports: ["archery"],
        rating: isCoach ? 4.9 : undefined,
        students: isCoach ? 48 : undefined,
        bio: isCoach 
          ? "Elite archery coach with over 15 years of experience." 
          : "Passionate about improving my archery skills.",
        experience: isCoach ? "15+ Years" : undefined,
        achievements: isCoach 
          ? ["National Coach Award 2020"] 
          : ["Regional Gold Medal 2022"]
      };
      
      // Store user in localStorage directly
      localStorage.setItem("ekalavya_user", JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: "Welcome to Ekalavya!",
      });
      
      // Force a hard reload to ensure the app reinitializes with the stored user data
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Pre-filled demo accounts for easy testing
  const loginAsDemoCoach = () => {
    form.setValue("email", "coach@example.com");
    form.setValue("password", "password123");
  };

  const loginAsDemoAthlete = () => {
    form.setValue("email", "athlete@example.com");
    form.setValue("password", "password123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground font-bold rounded-full w-12 h-12 flex items-center justify-center">
              E
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Ekalavya</CardTitle>
          <p className="text-muted-foreground mt-2">
            Sign in to continue to your sports training platform
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
                      <Input placeholder="Enter your email" {...field} />
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
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground mb-2">Demo Accounts:</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={loginAsDemoCoach} type="button">
                    Coach Login
                  </Button>
                  <Button variant="outline" size="sm" onClick={loginAsDemoAthlete} type="button">
                    Athlete Login
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary underline hover:text-primary/90">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
