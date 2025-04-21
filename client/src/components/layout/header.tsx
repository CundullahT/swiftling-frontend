import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "./sidebar";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
  };

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My List", href: "/my-list" },
    { name: "Add Phrase", href: "/add-phrase" },
    { name: "Quiz", href: "/quiz" },
  ];

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2" 
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </Button>

              <Link href="/dashboard" className="text-primary font-bold text-xl">
                LinguaLearn
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`text-sm font-medium ${
                    location === item.href 
                      ? "text-primary" 
                      : "text-slate-700 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name.charAt(0)}
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
                  <Link href="/settings" className="w-full cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="w-full cursor-pointer">
                    Log out
                  </Link>
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
