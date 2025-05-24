import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";

export function Shell() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user data is loaded from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("ekalavya_user");
      setIsLoading(false);
    };
    
    // Small delay to ensure auth context has loaded
    setTimeout(checkAuth, 100);
  }, []);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
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
