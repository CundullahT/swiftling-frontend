import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ClipboardList, 
  Plus, 
  HelpCircle, 
  Settings, 
  LogOut, 
  X 
} from "lucide-react";

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
      name: "My List", 
      href: "/my-list", 
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
    <nav className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-xl transform transition ease-in-out duration-300 z-30 flex flex-col h-full">
      <div className="px-4 py-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-xl">LinguaLearn</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6 text-slate-500" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 py-2">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-800">{user.name}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`w-full flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location === item.href 
                      ? "text-primary bg-primary-50" 
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t px-4 py-4">
        <Link href="/login">
          <a 
            className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-slate-700 hover:bg-slate-100"
            onClick={onClose}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </a>
        </Link>
      </div>
    </nav>
  );
}
