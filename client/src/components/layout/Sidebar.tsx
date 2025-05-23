import { BarChart3, Calendar, Users, Dumbbell, Camera, User, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const playerNavItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "coaches", label: "Coaches", icon: Users },
    { id: "training", label: "Training", icon: Dumbbell },
    { id: "ar-tools", label: "AR Tools", icon: Camera },
    { id: "profile", label: "Profile", icon: User },
  ];

  const coachNavItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "students", label: "Students", icon: Users },
    { id: "training-plans", label: "Training Plans", icon: Dumbbell },
    { id: "video-consulting", label: "Video Consulting", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  const navItems = user.role === 'athlete' ? playerNavItems : coachNavItems;

  return (
    <div className="w-64 bg-primary text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpeg" 
            alt="Ekalavya AI Logo" 
            className="w-10 h-10 object-contain rounded-lg bg-white p-1"
          />
          <h1 className="text-xl font-bold">Ekalavya</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary/80 text-white shadow-lg' 
                  : 'text-orange-100 hover:bg-primary/70'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-primary/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-green-200 capitalize">{user.role}</div>
          </div>
        </div>
        <Button 
          onClick={onLogout}
          variant="ghost" 
          size="sm"
          className="w-full text-white hover:bg-green-700"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}