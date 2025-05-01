import { useState, useCallback } from "react";
import { useLocation } from "wouter";

interface UseGuardedNavigationProps {
  isBlocked: boolean;
  onBlock?: (destination: string) => void;
}

export function useGuardedNavigation({ isBlocked, onBlock }: UseGuardedNavigationProps) {
  const [, navigate] = useLocation();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Override the navigate function to potentially block navigation
  const guardedNavigate = useCallback(
    (to: string) => {
      if (isBlocked) {
        // Store the path they're trying to navigate to
        setPendingPath(to);
        
        // Call the onBlock callback
        if (onBlock) {
          onBlock(to);
        }
        
        // Block navigation
        return false;
      } else {
        // Allow navigation
        navigate(to);
        return true;
      }
    },
    [isBlocked, navigate, onBlock]
  );

  // Function to navigate to the pending path
  const proceedToPath = useCallback(() => {
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [navigate, pendingPath]);

  // Function to clear the pending path without navigating
  const cancelNavigation = useCallback(() => {
    setPendingPath(null);
  }, []);

  return {
    navigate: guardedNavigate,
    pendingPath,
    proceedToPath,
    cancelNavigation,
  };
}