import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Auth Pages
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";

// App Pages
import Dashboard from "@/pages/app/dashboard";
import MyList from "@/pages/app/my-list";
import AddPhrase from "@/pages/app/add-phrase";
import Quiz from "@/pages/app/quiz";
import Settings from "@/pages/app/settings";

// Layout Components
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useState, useEffect } from "react";

function App() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if current route is an authenticated route
  useEffect(() => {
    const authenticatedRoutes = ['/dashboard', '/my-list', '/add-phrase', '/quiz', '/settings'];
    setIsAuthenticated(authenticatedRoutes.some(route => location.startsWith(route)));
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          {isAuthenticated && <Header />}
          
          <main className="flex-1">
            <Switch>
              {/* Auth Routes */}
              <Route path="/" component={Login} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/forgot-password" component={ForgotPassword} />
              
              {/* App Routes */}
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/my-list" component={MyList} />
              <Route path="/add-phrase" component={AddPhrase} />
              <Route path="/quiz" component={Quiz} />
              <Route path="/settings" component={Settings} />
              
              {/* Fallback to 404 */}
              <Route component={NotFound} />
            </Switch>
          </main>
          
          {isAuthenticated && <MobileNav />}
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
