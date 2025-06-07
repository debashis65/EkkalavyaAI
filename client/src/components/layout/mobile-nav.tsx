import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MobileNav({ className }: MobileNavProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fa-tachometer-alt" },
    { href: "/analytics", label: "Analytics", icon: "fa-chart-line" },
    { href: "/schedule", label: "Schedule", icon: "fa-calendar" },
    { href: "/profile", label: "Profile", icon: "fa-user" },
  ];

  return (
    <nav className={cn("bg-background shadow fixed bottom-0 left-0 right-0 z-10 md:hidden", className)}>
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            to={item.href}
            className="flex flex-col items-center p-2 text-xs"
          >
            <i className={`fas ${item.icon} ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'} mb-1 text-lg`}></i>
            <span className={isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
