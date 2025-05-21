import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fa-tachometer-alt" },
    { href: "/analytics", label: "Analytics", icon: "fa-chart-line" },
    { href: "/schedule", label: "Schedule", icon: "fa-calendar" },
    { href: "/coaches", label: "Coaches", icon: "fa-user-tie" },
    { href: "/training", label: "Training", icon: "fa-dumbbell" },
    { href: "/ar-tools", label: "AR Tools", icon: "fa-camera" },
    { href: "/profile", label: "Profile", icon: "fa-user" },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-sidebar text-sidebar-foreground", className)}>
      <div className="px-4 py-4 flex items-center">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-2">
          E
        </div>
        <span className="text-sidebar-foreground font-semibold text-lg">Ekalavya</span>
      </div>
      
      <nav className="flex-1 px-2 mt-5 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-2 py-2 text-sm font-medium rounded-md",
              isActive(item.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
            )}
          >
            <i className={`fas ${item.icon} mr-3 text-sm`}></i>
            {item.label}
          </Link>
        ))}
      </nav>
      
      {user && (
        <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="avatar w-10 h-10 mr-3 bg-sidebar-accent text-sidebar-accent-foreground">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-sidebar-accent-foreground/80 hover:text-sidebar-accent-foreground"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
