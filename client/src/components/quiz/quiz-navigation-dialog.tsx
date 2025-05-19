import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/context/quiz-context";

interface QuizNavigationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onProceed: () => void;
  onEndQuiz: () => void;
}

export function QuizNavigationDialog({
  open,
  onOpenChange,
  onContinue,
  onProceed,
  onEndQuiz,
}: QuizNavigationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Quiz in Progress</AlertDialogTitle>
          <AlertDialogDescription>
            Your quiz progress will be lost if you leave without ending the quiz properly.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={onContinue}
            className="sm:flex-1 bg-primary hover:bg-primary/90 text-white"
          >
            Continue Quiz
          </Button>
          <Button 
            onClick={onEndQuiz}
            className="sm:flex-1 bg-amber-500 hover:bg-amber-500/90 text-white"
          >
            Save and End
          </Button>
          <Button
            onClick={onProceed}
            className="sm:flex-1 bg-rose-600 hover:bg-rose-600/90 text-white"
          >
            Leave Anyway
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Custom component that manages navigation context
export function QuizNavigationGuard() {
  const { isQuizActive, pauseQuiz, unpauseQuiz, setQuizActive } = useQuiz();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Listen for navigation attempts
  useEffect(() => {
    if (!isQuizActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show a browser confirmation dialog
      const message = "Quiz in progress. Your progress will be lost if you leave.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // For browser tab closes/refreshes
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isQuizActive]);

  // Link click handler to intercept navigation
  useEffect(() => {
    if (!isQuizActive) return;

    const handleClick = (e: MouseEvent) => {
      // Check if the clicked element is a link
      let element = e.target as HTMLElement;
      let isLink = false;
      let href: string | null = null;

      // Traverse up to find closest anchor tag
      while (element && !isLink) {
        if (element.tagName === 'A') {
          isLink = true;
          href = (element as HTMLAnchorElement).getAttribute('href');
          break;
        }
        element = element.parentElement as HTMLElement;
      }

      // If it's an internal link that would navigate away
      if (isLink && href && !href.startsWith('http') && !href.startsWith('mailto:')) {
        e.preventDefault();
        setPendingUrl(href);
        setShowDialog(true);
        pauseQuiz(); // Pause the timer when showing the dialog
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isQuizActive, pauseQuiz]);

  // Add history navigation interception
  useEffect(() => {
    if (!isQuizActive) return;

    // Handle the popstate event (browser back/forward buttons)
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Store the current URL so we can go back here if needed
      setPendingUrl(window.location.pathname);
      setShowDialog(true);
      pauseQuiz(); // Pause the timer when showing the dialog
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isQuizActive, pauseQuiz]);

  // Handlers for dialog actions
  const handleContinue = () => {
    setShowDialog(false);
    setPendingUrl(null);
    unpauseQuiz(); // Resume the timer when closing the dialog
  };

  const handleProceed = () => {
    if (pendingUrl) {
      // End the quiz first by resetting the global state
      setQuizActive(false);
      // Then navigate to the pending URL using wouter's navigate
      navigate(pendingUrl);
    }
    setShowDialog(false);
  };

  const handleEndQuiz = () => {
    // End the quiz
    setQuizActive(false); // Update global quiz state
    
    if (pendingUrl) {
      // Navigate to the pending URL using wouter's navigate
      navigate(pendingUrl);
    }
    setShowDialog(false);
  };

  return (
    <QuizNavigationDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      onContinue={handleContinue}
      onProceed={handleProceed}
      onEndQuiz={handleEndQuiz}
    />
  );
}