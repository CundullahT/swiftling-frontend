import { ReactNode, MouseEvent, forwardRef, Ref } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuiz } from '@/context/quiz-context';

type GuardedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Component that wraps wouter's Link with quiz navigation protection
 */
export const GuardedLink = forwardRef(function GuardedLink(
  { href, children, className, onClick }: GuardedLinkProps, 
  ref: Ref<HTMLAnchorElement>
) {
  const { isQuizActive, pauseQuiz } = useQuiz();
  const [, navigate] = useLocation();
  
  // Handle click event to potentially intercept navigation
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // If a custom onClick was provided, execute it first
    if (onClick) {
      onClick(e);
    }
    
    // If the quiz is active, we want to prevent the default Link behavior
    if (isQuizActive) {
      e.preventDefault();
      
      // This doesn't actually navigate, but it will trigger the QuizNavigationDialog
      // via the navigation guard effect in quiz-navigation-dialog.tsx
      pauseQuiz();
      
      // Return early to prevent navigation
      return;
    }
  };
  
  return (
    <Link href={href} onClick={handleClick} className={className} ref={ref}>
      {children}
    </Link>
  );
});