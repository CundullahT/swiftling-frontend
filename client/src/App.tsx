import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

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
  const [isAuthenticated] = useState(true); // Always authenticated for now

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          {isAuthenticated && <Header />}
          
          <main className="flex-1">
            <Switch>
              {/* Main Routes - No authentication pages for now */}
              <Route path="/" component={Dashboard} />
              
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
