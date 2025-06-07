import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Calendar, User, Home } from "lucide-react";

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MobileNav({ className }: MobileNavProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className={cn("bg-white dark:bg-gray-900 shadow-lg border-t fixed bottom-0 left-0 right-0 z-50 md:hidden", className)}>
      <div className="flex justify-around py-1.5 sm:py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center p-2 sm:p-3 text-xs sm:text-sm transition-colors ${
                isActive(item.href) 
                  ? 'text-primary font-semibold' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${
                isActive(item.href) ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <span className="font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
