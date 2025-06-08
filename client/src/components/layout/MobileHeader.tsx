import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  user: { name: string; role: string };
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MobileHeader({ user, isMobileMenuOpen, setIsMobileMenuOpen }: MobileHeaderProps) {
  return (
    <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <img 
            src="/logo.jpeg" 
            alt="Ekalavya AI Logo" 
            className="w-6 h-6 object-contain rounded bg-white p-0.5"
          />
          <span className="text-lg font-bold text-gray-900">Ekalavya</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      </div>
    </div>
  );
}