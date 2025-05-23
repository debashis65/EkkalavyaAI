import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

import Login from "@/pages/login-simple";
import CoachDashboard from "@/components/CoachDashboard";
import PlayerDashboard from "@/components/PlayerDashboard";

// Simple user type
interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Check for stored user on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("ekalavya_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("ekalavya_user");
      }
    }
  }, []);

  // If user is logged in, show role-based dashboard
  if (user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {user.role === 'coach' ? <CoachDashboard user={user} setUser={setUser} /> : <PlayerDashboard user={user} setUser={setUser} />}
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If user is not logged in, show login page
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;