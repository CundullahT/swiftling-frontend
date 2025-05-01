import { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextProps {
  isQuizActive: boolean;
  setQuizActive: (active: boolean) => void;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [isQuizActive, setIsQuizActive] = useState(false);

  const setQuizActive = (active: boolean) => {
    setIsQuizActive(active);
  };

  return (
    <QuizContext.Provider value={{ isQuizActive, setQuizActive }}>
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