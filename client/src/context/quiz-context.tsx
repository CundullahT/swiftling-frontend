import { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextProps {
  isQuizActive: boolean;
  setQuizActive: (active: boolean) => void;
  isPaused: boolean;
  pauseQuiz: () => void;
  unpauseQuiz: () => void;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const setQuizActive = (active: boolean) => {
    setIsQuizActive(active);
    if (!active) {
      // Make sure pause is reset when quiz is deactivated
      setIsPaused(false);
    }
  };

  const pauseQuiz = () => {
    if (isQuizActive) {
      setIsPaused(true);
    }
  };

  const unpauseQuiz = () => {
    setIsPaused(false);
  };

  return (
    <QuizContext.Provider value={{ 
      isQuizActive, 
      setQuizActive, 
      isPaused, 
      pauseQuiz, 
      unpauseQuiz 
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}