import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X } from "lucide-react";
import { PieTimer } from "./pie-timer";

// Mock data until we connect to real API
const MOCK_PHRASES = [
  { id: 1, phrase: "Hello", translation: "Hola", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 2, phrase: "Goodbye", translation: "Adiós", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 3, phrase: "Thank you", translation: "Gracias", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 4, phrase: "Please", translation: "Por favor", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 5, phrase: "Sorry", translation: "Lo siento", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 6, phrase: "Good morning", translation: "Buenos días", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 7, phrase: "Good night", translation: "Buenas noches", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 8, phrase: "How are you?", translation: "¿Cómo estás?", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 9, phrase: "I don't understand", translation: "No entiendo", sourceLanguage: "English", targetLanguage: "Spanish" },
  { id: 10, phrase: "Where is...", translation: "Dónde está...", sourceLanguage: "English", targetLanguage: "Spanish" },
];

// Shuffle array utility function
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface QuizGameProps {
  quizType: string;
  minTime: number;
  startTime: number;
  maxTime: number;
  onComplete: () => void;
}

export function QuizGame({ quizType, minTime, startTime, maxTime, onComplete }: QuizGameProps) {
  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(startTime);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(startTime);
  const [previousQuestionTime, setPreviousQuestionTime] = useState(startTime);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<boolean | null>(null); // Track the last answer result separately
  const [questionType, setQuestionType] = useState<'original' | 'translation'>(
    Math.random() > 0.5 ? 'original' : 'translation'
  );
  const [phrases, setPhrases] = useState(MOCK_PHRASES);
  const [options, setOptions] = useState<Array<{ id: number, text: string }>>([]);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  
  // Timer interval reference
  const [timerActive, setTimerActive] = useState(true);
  
  // Setup the question and options only when currentQuestionIndex changes
  useEffect(() => {
    // Only proceed if component is mounted
    let isMounted = true;
    
    // For debugging - log values
    console.log(`Question ${currentQuestionIndex}: Last result: ${lastResult}, Previous time: ${previousQuestionTime}`);
    
    // Reset states for new question
    setSelectedAnswer(null);
    setIsRevealing(false);
    
    // Calculate new time based on previous performance (or use starting time for first question)
    let newTime = startTime; // Default for first question
    
    if (currentQuestionIndex > 0) {
      if (lastResult === true) {
        // Decrease by 1 second if previous answer was correct
        newTime = Math.max(previousQuestionTime - 1, minTime);
        console.log(`Decreasing time by 1 second. New time: ${newTime}`);
      } else {
        // Increase by 1 second if previous answer was incorrect OR time expired
        newTime = Math.min(previousQuestionTime + 1, maxTime);
        console.log(`Increasing time by 1 second. New time: ${newTime}`);
      }
    }
    
    // Ensure time is within min/max limits
    newTime = Math.min(Math.max(newTime, minTime), maxTime);
    
    // Save the current question time for reference in the next question
    setPreviousQuestionTime(newTime);
    
    // Set the time for the current question
    if (isMounted) {
      setTimeLeft(newTime);
      setCurrentQuestionTime(newTime);
      
      // Short delay to ensure the new question is fully rendered before starting timer
      const timerId = setTimeout(() => {
        if (isMounted) {
          setTimerActive(true);
        }
      }, 100);
      
      // Clean up function to prevent memory leaks or actions after unmount
      return () => {
        clearTimeout(timerId);
        isMounted = false;
      };
    }
    
    // Randomly decide if we're asking for original phrase or translation
    const newQuestionType = Math.random() > 0.5 ? 'original' : 'translation';
    setQuestionType(newQuestionType);
    
    // Create a random set of phrases for this question
    const availablePhrases = shuffleArray(phrases);
    const currentPhrase = availablePhrases[0];
    const otherPhrases = availablePhrases.slice(1, 5);
    
    // Set up options based on question type
    let newOptions: Array<{ id: number, text: string }> = [];
    
    if (newQuestionType === 'original') {
      // Question is original phrase, options are translations
      const correctOption = { id: currentPhrase.id, text: currentPhrase.translation };
      const wrongOptions = otherPhrases.map(p => ({ id: p.id, text: p.translation }));
      newOptions = shuffleArray([correctOption, ...wrongOptions]);
      setCorrectAnswerId(currentPhrase.id);
    } else {
      // Question is translation, options are original phrases
      const correctOption = { id: currentPhrase.id, text: currentPhrase.phrase };
      const wrongOptions = otherPhrases.map(p => ({ id: p.id, text: p.phrase }));
      newOptions = shuffleArray([correctOption, ...wrongOptions]);
      setCorrectAnswerId(currentPhrase.id);
    }
    
    setOptions(newOptions);
  }, [currentQuestionIndex, minTime, maxTime, startTime, previousQuestionTime, lastResult]);
  
  // Timer effect
  useEffect(() => {
    if (!timerActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerActive(false);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timerActive]);
  
  // Handle time up
  const handleTimeUp = () => {
    setIsRevealing(true);
    setIsCorrect(null); // Explicitly mark as timed out (null means time expired)
    setLastResult(false); // Count timed out as incorrect for timer adjustment
    
    // Wait 5 seconds then move to next question
    const timer = setTimeout(() => {
      moveToNextQuestion();
    }, 5000);
    
    // To be safe, ensure any potential re-renders don't cancel this timeout
    return () => clearTimeout(timer);
  };
  
  // Handle answer selection
  const handleSelectAnswer = (optionId: number) => {
    if (isRevealing || !timerActive) return;
    
    // Disable timer and mark as revealing answer
    setTimerActive(false);
    setIsRevealing(true);
    
    // Set which answer was selected
    setSelectedAnswer(optionId);
    
    // Check if answer is correct and save result
    const isAnswerCorrect = optionId === correctAnswerId;
    setIsCorrect(isAnswerCorrect);
    setLastResult(isAnswerCorrect); // Save result for next question's timer
    
    // Use a fixed reveal duration to ensure user can see the correct answer
    console.log(`Answer selected. Will show result for 5 seconds.`);
    
    // Wait 5 seconds then move to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 5000);
  };
  
  // Move to next question
  const moveToNextQuestion = () => {
    // Make sure timer is stopped 
    setTimerActive(false);
    
    // Add a small delay to ensure state updates have time to propagate
    console.log("Moving to next question...");
    
    // Update the question index which will trigger the useEffect to set up the next question
    setTimeout(() => {
      setCurrentQuestionIndex(prev => (prev + 1) % phrases.length);
    }, 100);
  };
  
  // Get current question
  const getCurrentQuestion = () => {
    if (phrases.length === 0) return { question: '', sourceLanguage: '', targetLanguage: '' };
    
    const currentPhrase = phrases[currentQuestionIndex % phrases.length];
    
    if (questionType === 'original') {
      return { 
        question: currentPhrase.phrase, 
        sourceLanguage: currentPhrase.sourceLanguage,
        targetLanguage: currentPhrase.targetLanguage
      };
    } else {
      return { 
        question: currentPhrase.translation, 
        sourceLanguage: currentPhrase.targetLanguage,
        targetLanguage: currentPhrase.sourceLanguage
      };
    }
  };
  
  const { question, sourceLanguage, targetLanguage } = getCurrentQuestion();
  
  return (
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {/* Timer and Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1}
        </div>
        <div className="flex items-center">
          <PieTimer
            timeLeft={timeLeft}
            totalTime={currentQuestionTime}
            size={70}
            strokeWidth={6}
          />
        </div>
      </div>
      
      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-1">
            <div className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
              {sourceLanguage}
            </div>
            <div className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
              {questionType === 'original' ? 'Translate to' : 'Select the original phrase in'} {targetLanguage}
            </div>
          </div>
          <h3 className="text-2xl font-medium mt-4 mb-3 text-center">
            {question}
          </h3>
        </CardContent>
      </Card>
      
      {/* Answer Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectAnswer = option.id === correctAnswerId;
          
          let optionClassName = "relative p-4 border-2 rounded-lg hover:border-primary/50 transition-all";
          
          if (isRevealing) {
            if (isCorrectAnswer) {
              optionClassName = "relative p-4 border-2 border-green-500 bg-green-50 rounded-lg";
            } else if (isSelected && !isCorrectAnswer) {
              optionClassName = "relative p-4 border-2 border-red-500 bg-red-50 rounded-lg";
            } else {
              optionClassName = "relative p-4 border-2 border-gray-200 rounded-lg opacity-70";
            }
          } else {
            optionClassName = "relative p-4 border-2 border-gray-200 rounded-lg hover:border-primary/50 cursor-pointer transition-all";
          }
          
          return (
            <div 
              key={option.id}
              className={optionClassName}
              onClick={() => handleSelectAnswer(option.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-base">{option.text}</span>
                {isRevealing && (
                  <div className="flex-shrink-0">
                    {isCorrectAnswer && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                        <Check className="w-4 h-4 text-green-600" />
                      </span>
                    )}
                    {isSelected && !isCorrectAnswer && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                        <X className="w-4 h-4 text-red-600" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Skip button */}
      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={onComplete}>
          End Quiz
        </Button>
      </div>
    </div>
  );
}