import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/context/auth-context";

export function Shell() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop sidebar navigation */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-60 md:flex-col">
        <Sidebar />
      </div>
      
      {/* Mobile bottom navigation */}
      {isMobile && <MobileNav />}
      
      {/* Main content */}
      <div className="md:pl-60 flex flex-col flex-1">
        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
