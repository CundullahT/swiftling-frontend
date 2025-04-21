import { Link, useLocation } from "wouter";
import { Home, ClipboardList, Plus, HelpCircle } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  
  const navigationItems = [
    { 
      name: "Home", 
      href: "/dashboard", 
      icon: <Home className="h-6 w-6" /> 
    },
    { 
      name: "My List", 
      href: "/my-list", 
      icon: <ClipboardList className="h-6 w-6" /> 
    },
    { 
      name: "Add", 
      href: "/add-phrase", 
      icon: <Plus className="h-6 w-6" /> 
    },
    { 
      name: "Quiz", 
      href: "/quiz", 
      icon: <HelpCircle className="h-6 w-6" /> 
    },
  ];

  return (
    <div className="md:hidden bg-white border-t fixed bottom-0 left-0 right-0 z-30">
      <div className="flex justify-around">
        {navigationItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <a 
              className={`flex flex-col items-center py-2 px-4 ${
                location === item.href 
                  ? "text-primary" 
                  : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
