import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard-fixed";
import Analytics from "@/pages/analytics";
import Schedule from "@/pages/schedule";
import Coaches from "@/pages/coaches";
import Training from "@/pages/training";
import ArTools from "@/pages/ar-tools";
import Profile from "@/pages/profile-working";
import Login from "@/pages/login-improved";
import Register from "@/pages/register-improved";
import AthleteProfile from "@/pages/athlete-profile";
import CoachProfile from "@/pages/coach-profile-fixed";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/shell";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

// Simple authentication wrapper component
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Don't check authentication on login and register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return children;
  }
  
  // If not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <RequireAuth>
                <Shell />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="coaches" element={<Coaches />} />
            <Route path="training" element={<Training />} />
            <Route path="ar-tools" element={<ArTools />} />
            <Route path="profile" element={<Profile />} />
            <Route path="athlete/:id" element={<AthleteProfile />} />
            <Route path="coach/:id" element={<CoachProfile />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
