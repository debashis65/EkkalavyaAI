import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

import Login from "@/pages/login-simple";
import CoachDashboard from "@/components/CoachDashboard";
import PlayerDashboard from "@/components/PlayerDashboard";
import Sidebar from "@/components/layout/Sidebar";
import Analytics from "@/pages/analytics";
import Schedule from "@/pages/schedule";
import Coaches from "@/pages/coaches";
import Training from "@/pages/training";
import ARTools from "@/pages/ar-tools-new";
import Profile from "@/pages/profile-simple";

// Simple user type
interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("ekalavya_user");
    setActiveTab("dashboard");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        if (user?.role === 'coach') {
          return <CoachDashboard user={user} setUser={setUser} />;
        } else {
          return <PlayerDashboard user={user} setUser={setUser} />;
        }
      case "analytics":
        return <Analytics />;
      case "schedule":
        return <Schedule />;
      case "coaches":
        return <Coaches />;
      case "training":
        return <Training />;
      case "ar-tools":
        return <ARTools />;
      case "profile":
        return <Profile />;
      case "students":
        return <Coaches />; // Reuse coaches component for students view
      case "training-plans":
        return <Training />; // Reuse training component for training plans
      case "messages":
        return (
          <div className="p-8 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
            <p className="text-gray-600">Message functionality coming soon...</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-8 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="p-8 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-gray-600">This section is coming soon...</p>
          </div>
        );
    }
  };

  // If user is logged in, show sidebar with content
  if (user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="flex min-h-screen">
            <Sidebar 
              user={user}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
            />
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If user is not logged in, show login page
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Login setUser={setUser} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;