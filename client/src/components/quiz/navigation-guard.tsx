import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface NavigationGuardProps {
  isQuizActive: boolean;
  onContinueQuiz: () => void;
  onEndQuiz: () => void;
}

export function NavigationGuard({ isQuizActive, onContinueQuiz, onEndQuiz }: NavigationGuardProps) {
  const [location, navigate] = useLocation();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Set up an effect to run when location changes or isQuizActive changes
  useEffect(() => {
    if (!isQuizActive) return; // Only run when quiz is active

    // Store the current location so we know where we started
    const startLocation = location;
    
    // Function to handle before unload events (browser tab close, etc.)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Quiz in progress. Your progress will be lost if you leave.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Add the event listener for browser navigation
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isQuizActive, location]);

  // Function to intercept navigation
  const interceptNavigation = (path: string) => {
    if (isQuizActive && path !== location) {
      // Store the path they're trying to navigate to
      setPendingNavigation(path);
      // Show the confirmation dialog
      setShowDialog(true);
      return false; // Prevents navigation
    }
    return true; // Allow navigation
  };

  // Handle continue action
  const handleContinue = () => {
    setShowDialog(false);
    setPendingNavigation(null);
    onContinueQuiz();
  };

  // Handle proceed action
  const handleProceed = () => {
    setShowDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  // Handle end quiz action
  const handleEndQuiz = () => {
    setShowDialog(false);
    onEndQuiz();
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  return (
    <>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Quiz in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Your quiz progress will be lost if you leave without ending the quiz properly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleContinue}
              className="sm:flex-1"
            >
              Continue Quiz
            </Button>
            <Button 
              variant="secondary"
              onClick={handleProceed}
              className="sm:flex-1"
            >
              Leave Anyway
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndQuiz}
              className="sm:flex-1"
            >
              End Quiz
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}