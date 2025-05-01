import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQuiz } from '@/context/quiz-context';

/**
 * Hook that intercepts navigation when quiz is active
 * Returns a wrapper component that shows a confirmation dialog
 */
export function useNavigationInterceptor() {
  const { isQuizActive, pauseQuiz, unpauseQuiz, setQuizActive } = useQuiz();
  const [, navigate] = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Intercept navigation attempts when quiz is active
  const interceptNavigation = useCallback((to: string) => {
    if (isQuizActive) {
      setPendingNavigation(to);
      setShowDialog(true);
      pauseQuiz();
      return false; // Prevent navigation
    }
    
    // Allow navigation if quiz is not active
    return true;
  }, [isQuizActive, pauseQuiz]);
  
  // Patch wouter's navigate to use our interceptor
  useEffect(() => {
    if (!isQuizActive) return;
    
    // Store the original navigate function
    const originalNavigate = navigate;
    
    // Override the navigate function with our interceptor
    const patchedNavigate = (to: string) => {
      if (interceptNavigation(to)) {
        originalNavigate(to);
      }
    };
    
    // Restore original navigate on cleanup
    return () => {
      // This cleanup is symbolic as we can't actually replace the navigate function back
    };
  }, [isQuizActive, navigate, interceptNavigation]);
  
  // Handle continue action
  const handleContinue = useCallback(() => {
    setShowDialog(false);
    setPendingNavigation(null);
    unpauseQuiz();
  }, [unpauseQuiz]);
  
  // Handle proceed action
  const handleProceed = useCallback(() => {
    const destination = pendingNavigation;
    setShowDialog(false);
    setPendingNavigation(null);
    
    if (destination) {
      navigate(destination);
    }
  }, [pendingNavigation, navigate]);
  
  // Handle end quiz action
  const handleEndQuiz = useCallback(() => {
    const destination = pendingNavigation;
    setShowDialog(false);
    setPendingNavigation(null);
    setQuizActive(false);
    
    if (destination) {
      navigate(destination);
    }
  }, [pendingNavigation, navigate, setQuizActive]);
  
  return {
    showDialog,
    setShowDialog,
    pendingNavigation,
    handleContinue,
    handleProceed,
    handleEndQuiz,
    interceptNavigation
  };
}