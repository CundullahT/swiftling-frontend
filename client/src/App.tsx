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
import QuizHistory from "@/pages/app/quiz-history";
import Settings from "@/pages/app/settings";

// Auth Pages
import ForgotPassword from "@/pages/auth/forgot-password";
import PasswordChangeVerification from "@/pages/auth/verify-pass-change";
import SignUpVerification from "@/pages/auth/verify-sign-up";
// Import the Signup page directly using the full relative path
import Signup from "./pages/auth/signup";

// Layout Components
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useState, useEffect, useCallback } from "react";

// Custom Hooks
import { useScrollTop } from "@/hooks/use-scroll-top";

// Quiz Context Provider and Navigation Guard
import { QuizProvider } from "@/context/quiz-context";
import { QuizNavigationGuard } from "@/components/quiz/quiz-navigation-dialog";

function App() {
  const [location] = useLocation();
  const [isAuthenticated] = useState(true); // Always authenticated for now
  
  // Use scroll-to-top hook
  useScrollTop();

  // Check if current path is an auth route
  const isAuthRoute = location.startsWith('/auth/');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <QuizProvider>
          <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Show header only for non-auth routes when authenticated */}
            {isAuthenticated && !isAuthRoute && <Header />}
            
            <main className="flex-1">
              <Switch>
                {/* Main Routes - No authentication pages for now */}
                <Route path="/" component={Dashboard} />
                
                {/* App Routes */}
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/my-phrases" component={MyList} />
                <Route path="/add-phrase" component={AddPhrase} />
                <Route path="/quiz" component={Quiz} />
                <Route path="/quiz-history" component={QuizHistory} />
                <Route path="/settings" component={Settings} />
                
                {/* Auth Routes */}
                <Route path="/auth/forgot-password" component={ForgotPassword} />
                <Route path="/auth/verify-pass-change" component={PasswordChangeVerification} />
                <Route path="/auth/verify-sign-up" component={SignUpVerification} />
                <Route path="/signup" component={Signup} />
                
                {/* Fallback to 404 */}
                <Route component={NotFound} />
              </Switch>
            </main>
            
            {/* Show mobile nav only for non-auth routes when authenticated */}
            {isAuthenticated && !isAuthRoute && <MobileNav />}
            <Toaster />
            
            {/* Quiz Navigation Guard */}
            <QuizNavigationGuard />
          </div>
        </QuizProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
