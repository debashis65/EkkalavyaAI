import { 
  BarChart3, Calendar, Users, Dumbbell, Camera, User, Settings, MessageSquare, 
  Home, TrendingUp, GraduationCap, ClipboardList, Video
} from "lucide-react";
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
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const playerNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "coaches", label: "Coaches", icon: GraduationCap },
    { id: "training", label: "Training", icon: Dumbbell },
    { id: "ar-tools", label: "AR Tools", icon: Camera },
    { id: "profile", label: "Profile", icon: User },
  ];

  const coachNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "students", label: "Students", icon: Users },
    { id: "training-plans", label: "Training Plans", icon: ClipboardList },
    { id: "video-consulting", label: "Video Consulting", icon: Video },
    { id: "profile", label: "Profile", icon: User },
  ];

  const navItems = user.role === 'athlete' ? playerNavItems : coachNavItems;

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile-First Sidebar */}
      <div className={`
        fixed left-0 top-0 z-50 h-full bg-primary text-white transition-transform duration-300 
        md:static md:translate-x-0 md:w-16 md:hover:w-64 md:group
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
      `}>
        {/* Logo */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Ekalavya Sports AI Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg flex-shrink-0"
            />
            <h1 className="text-lg sm:text-xl font-bold md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Ekalavya
            </h1>
          </div>
        </div>

      {/* Navigation Items - Mobile First */}
      <nav className="flex-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 mb-1.5 sm:mb-2 rounded-lg text-left transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-secondary text-white shadow-lg' 
                  : 'text-orange-100 hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout - Mobile First */}
      <div className="p-2 border-t border-primary/40">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <div className="font-medium text-xs sm:text-sm whitespace-nowrap">{user.name}</div>
            <div className="text-xs text-orange-200 capitalize">{user.role}</div>
          </div>
        </div>
        <Button 
          onClick={onLogout}
          variant="ghost" 
          size="sm"
          className="w-full bg-white text-secondary hover:bg-gray-100 hover:text-secondary px-2 py-1.5 sm:py-2 text-xs sm:text-sm"
        >
          <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 font-medium">
            Logout
          </span>
        </Button>
      </div>
      </div>
    </>
  );
}