import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import { GuardedLink } from "@/components/ui/guarded-link";
import { useAuth } from "@/context/auth-context";

// Function to decode JWT token and extract user information
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { tokens } = useAuth();

  // Extract user information from JWT token
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (tokens?.access_token) {
      const decoded = decodeJWT(tokens.access_token);
      if (decoded) {
        const userInfo = {
          name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim() || decoded.preferred_username || decoded.username || "User",
          email: decoded.email || decoded.username || "",
        };
        setUser(userInfo);
      }
    }
  }, [tokens]);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Phrases", href: "/my-phrases" },
    { name: "Add Phrase", href: "/add-phrase" },
    { name: "Quiz", href: "/quiz" },
  ];

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2" 
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6 text-secondary" />
              </Button>

              <GuardedLink href="/dashboard" className="font-bold text-xl flex items-center gap-2">
                <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-8 w-auto" />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SwiftLing</span>
              </GuardedLink>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <GuardedLink 
                  key={item.name} 
                  href={item.href} 
                  className={`text-sm font-medium ${
                    location === item.href 
                      ? "text-primary border-b-2 border-primary pb-1" 
                      : "text-secondary/80 hover:text-primary hover:border-b-2 hover:border-primary/50 pb-1 transition-all duration-200"
                  }`}
                >
                  {item.name}
                </GuardedLink>
              ))}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <GuardedLink href="/settings" className="w-full cursor-pointer">
                    Settings
                  </GuardedLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <GuardedLink href="/logout" className="w-full cursor-pointer">
                    Log out
                  </GuardedLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/25" 
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}
    </>
  );
}
