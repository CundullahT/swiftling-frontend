import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ClipboardList, 
  Plus, 
  HelpCircle, 
  Settings, 
  LogOut, 
  X,
  User 
} from "lucide-react";
import { GuardedLink } from "@/components/ui/guarded-link";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
  };

  const navigationItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: <Home className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "My Phrases", 
      href: "/my-phrases", 
      icon: <ClipboardList className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "Add Phrase", 
      href: "/add-phrase", 
      icon: <Plus className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "Quiz", 
      href: "/quiz", 
      icon: <HelpCircle className="h-5 w-5 mr-3" /> 
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: <Settings className="h-5 w-5 mr-3" /> 
    },
  ];

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-xl transform transition ease-in-out duration-300 z-30 flex flex-col h-full border-r-2 border-primary/10">
      <div className="px-4 py-6 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-8 w-auto" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-xl">SwiftLing</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6 text-secondary/70 hover:text-primary transition-colors" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 py-2">
          <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
            <Avatar className="border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-secondary">{user.name}</div>
              <div className="text-sm text-primary/70">{user.email}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <GuardedLink 
                key={item.name} 
                href={item.href}
                className={`w-full flex items-center px-3 py-2.5 text-base font-medium rounded-md transition-all duration-200 ${
                  location === item.href 
                    ? "text-white bg-primary shadow-md" 
                    : "text-secondary/80 hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={onClose}
              >
                <span className={location === item.href ? "text-white" : "text-primary"}>
                  {item.icon}
                </span>
                {item.name}
              </GuardedLink>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t border-primary/20 px-4 py-4 bg-gradient-to-r from-primary/5 to-transparent">
        <GuardedLink 
          href="/logout"
          className="w-full flex items-center px-3 py-2.5 text-base font-medium rounded-md text-secondary/80 hover:bg-accent/10 hover:text-accent transition-all duration-200"
          onClick={onClose}
        >
          <LogOut className="h-5 w-5 mr-3 text-accent" />
          Logout
        </GuardedLink>
      </div>
    </nav>
  );
}
