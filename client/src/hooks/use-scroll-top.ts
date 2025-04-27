import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A custom hook that scrolls to the top of the page when the route changes
 */
export function useScrollTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]); // Re-run when location changes
}