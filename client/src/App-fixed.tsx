import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Analytics from "@/pages/analytics";
import Schedule from "@/pages/schedule";
import Coaches from "@/pages/coaches";
import Training from "@/pages/training";
import ArTools from "@/pages/ar-tools";
import Profile from "@/pages/profile-working";
import Login from "@/pages/login-improved";
import Register from "@/pages/register-improved";
import TwoFactorAuth from "@/pages/two-factor-auth";
import AthleteProfile from "@/pages/athlete-profile";
import CoachProfile from "@/pages/coach-profile-fixed";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/shell";
import { useAuth } from "@/context/auth-context";

// Role-specific dashboard components
const CoachDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Coach Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Active Students</h3>
        <p className="text-3xl font-bold text-green-600">48</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Today's Sessions</h3>
        <p className="text-3xl font-bold text-blue-600">6</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Rating</h3>
        <p className="text-3xl font-bold text-yellow-600">4.9</p>
      </div>
    </div>
  </div>
);

const AthleteDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Athlete Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Training Sessions</h3>
        <p className="text-3xl font-bold text-green-600">24</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Performance Score</h3>
        <p className="text-3xl font-bold text-blue-600">85%</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Upcoming Sessions</h3>
        <p className="text-3xl font-bold text-yellow-600">3</p>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
        <p className="text-3xl font-bold text-green-600">1,248</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Active Coaches</h3>
        <p className="text-3xl font-bold text-blue-600">156</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Platform Revenue</h3>
        <p className="text-3xl font-bold text-yellow-600">₹2.4L</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Page Component following your exact pattern
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'coach':
        return <CoachDashboard />;
      case 'athlete':
        return <AthleteDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <Shell>
      {renderDashboard()}
    </Shell>
  );
};

function App() {
  const { user } = useAuth();

  // If user is logged in, show authenticated routes
  if (user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<Shell><Analytics /></Shell>} />
            <Route path="/schedule" element={<Shell><Schedule /></Shell>} />
            <Route path="/coaches" element={<Shell><Coaches /></Shell>} />
            <Route path="/training" element={<Shell><Training /></Shell>} />
            <Route path="/ar-tools" element={<Shell><ArTools /></Shell>} />
            <Route path="/profile" element={<Shell><Profile /></Shell>} />
            <Route path="/athlete/:id" element={<Shell><AthleteProfile /></Shell>} />
            <Route path="/coach/:id" element={<Shell><CoachProfile /></Shell>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // If user is not logged in, show public routes only
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;