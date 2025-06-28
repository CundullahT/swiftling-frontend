import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// App Pages
import Dashboard from "@/pages/app/dashboard";
import MyPhrases from "@/pages/app/my-phrases";
import AddPhrase from "@/pages/app/add-phrase";
import Quiz from "@/pages/app/quiz";
import QuizHistory from "@/pages/app/quiz-history";
import Settings from "@/pages/app/settings";

// Auth Pages
import ForgotPassword from "@/pages/auth/forgot-password";
import PasswordChangeVerification from "@/pages/auth/verify-pass-change";
import SignUpVerification from "@/pages/auth/verify-sign-up";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/login";

// Legal Pages
import TermsOfService from "./pages/legal/terms-of-service";
import PrivacyPolicy from "./pages/legal/privacy-policy";

// Layout Components
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

// Custom Hooks
import { useScrollTop } from "@/hooks/use-scroll-top";

// Quiz Context Provider and Navigation Guard
import { QuizProvider } from "@/context/quiz-context";
import { QuizNavigationGuard } from "@/components/quiz/quiz-navigation-dialog";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";

// Logout Handler Component
function LogoutHandler() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        setLocation('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, redirect to login
        setLocation('/login');
      }
    };

    handleLogout();
  }, [logout, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

// App content component that uses authentication context
function AppContent() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Use scroll-to-top hook
  useScrollTop();

  // Check if current path is an auth route, signup/login page, or legal page
  const isAuthRoute = location.startsWith('/auth/') || location === '/signup' || location === '/login' || location.startsWith('/legal/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Show header only for non-auth routes when authenticated */}
      {isAuthenticated && !isAuthRoute && <Header />}
      
      <main className="flex-1">
        <Switch>
          {/* Protected App Routes */}
          <Route path="/">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/my-phrases">
            <ProtectedRoute>
              <MyPhrases />
            </ProtectedRoute>
          </Route>
          <Route path="/add-phrase">
            <ProtectedRoute>
              <AddPhrase />
            </ProtectedRoute>
          </Route>
          <Route path="/quiz">
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          </Route>
          <Route path="/quiz-history">
            <ProtectedRoute>
              <QuizHistory />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          
          {/* Public Auth Routes */}
          <Route path="/auth/forgot-password" component={ForgotPassword} />
          <Route path="/auth/verify-pass-change" component={PasswordChangeVerification} />
          <Route path="/auth/verify-sign-up" component={SignUpVerification} />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          
          {/* Public Legal Routes */}
          <Route path="/legal/terms-of-service" component={TermsOfService} />
          <Route path="/legal/privacy-policy" component={PrivacyPolicy} />
          
          {/* Logout Route */}
          <Route path="/logout">
            <LogoutHandler />
          </Route>
          
          {/* Not Found */}
          <Route component={NotFound} />
        </Switch>
        
        {/* Show mobile navigation only for non-auth routes when authenticated */}
        {isAuthenticated && !isAuthRoute && <MobileNav />}
      </main>
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Quiz Navigation Guard */}
      <QuizNavigationGuard />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <QuizProvider>
            <AppContent />
          </QuizProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;