import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { PieTimer } from "./pie-timer";
import { LANGUAGES } from "@/lib/constants";
import { useQuiz } from "@/context/quiz-context";

// Phrase interface matching the one from quiz.tsx
interface Phrase {
  originalPhrase: string;
  originalLanguage: string;
  meaning: string;
  meaningLanguage: string;
  phraseTags: string[];
  status: string;
  notes: string;
  consecutiveCorrectAmount: number;
  answeredWrongOrTimedOutAtLeastOnce: boolean;
}

// Multi-language phrases
const MOCK_PHRASES = [
  // Turkish-English phrases
  { id: 1, phrase: "Merhaba", translation: "Hello", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 2, phrase: "Hoşça kal", translation: "Goodbye", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 3, phrase: "Teşekkür ederim", translation: "Thank you", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 4, phrase: "Lütfen", translation: "Please", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 5, phrase: "Özür dilerim", translation: "I'm sorry", sourceLanguage: "Turkish", targetLanguage: "English" },
  
  // Spanish-English phrases
  { id: 6, phrase: "Hola", translation: "Hello", sourceLanguage: "Spanish", targetLanguage: "English" },
  { id: 7, phrase: "Adiós", translation: "Goodbye", sourceLanguage: "Spanish", targetLanguage: "English" },
  { id: 8, phrase: "Gracias", translation: "Thank you", sourceLanguage: "Spanish", targetLanguage: "English" },
  { id: 9, phrase: "Por favor", translation: "Please", sourceLanguage: "Spanish", targetLanguage: "English" },
  { id: 10, phrase: "Lo siento", translation: "I'm sorry", sourceLanguage: "Spanish", targetLanguage: "English" },
  
  // French-English phrases
  { id: 11, phrase: "Bonjour", translation: "Hello", sourceLanguage: "French", targetLanguage: "English" },
  { id: 12, phrase: "Au revoir", translation: "Goodbye", sourceLanguage: "French", targetLanguage: "English" },
  { id: 13, phrase: "Merci", translation: "Thank you", sourceLanguage: "French", targetLanguage: "English" },
  { id: 14, phrase: "S'il vous plaît", translation: "Please", sourceLanguage: "French", targetLanguage: "English" },
  { id: 15, phrase: "Je suis désolé", translation: "I'm sorry", sourceLanguage: "French", targetLanguage: "English" },
  
  // German-English phrases
  { id: 16, phrase: "Hallo", translation: "Hello", sourceLanguage: "German", targetLanguage: "English" },
  { id: 17, phrase: "Auf Wiedersehen", translation: "Goodbye", sourceLanguage: "German", targetLanguage: "English" },
  { id: 18, phrase: "Danke", translation: "Thank you", sourceLanguage: "German", targetLanguage: "English" },
  { id: 19, phrase: "Bitte", translation: "Please", sourceLanguage: "German", targetLanguage: "English" },
  { id: 20, phrase: "Es tut mir leid", translation: "I'm sorry", sourceLanguage: "German", targetLanguage: "English" },
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
  selectedLanguages?: string[];
  quizPhrases?: Map<string, Phrase>;
}

export function QuizGame({ quizType, minTime, startTime, maxTime, onComplete, selectedLanguages = [], quizPhrases }: QuizGameProps) {
  // Get quiz pause state from context
  const { isPaused } = useQuiz();
  
  // Main states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(startTime);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(startTime); // Store starting time for each question
  const [answered, setAnswered] = useState(false);
  const [userAnswered, setUserAnswered] = useState(false); // Track if user provided an answer (vs. timeout)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [phrases, setPhrases] = useState(shuffleArray(MOCK_PHRASES));
  const [options, setOptions] = useState<Array<{ id: number, text: string }>>([]);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [questionType, setQuestionType] = useState<'original' | 'translation'>(
    Math.random() > 0.5 ? 'original' : 'translation'
  );
  // Performance counters
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeoutCount, setTimeoutCount] = useState(0);
  
  // Filter phrases based on selected languages
  useEffect(() => {
    let newPhrases;
    
    // If "all" is selected or no language selected, use all phrases
    if (selectedLanguages.includes('all') || selectedLanguages.length === 0) {
      newPhrases = shuffleArray(MOCK_PHRASES);
    } else {
      // Filter phrases to include only those in the selected languages
      const filteredPhrases = MOCK_PHRASES.filter(phrase => {
        const sourceLang = phrase.sourceLanguage.toLowerCase();
        const targetLang = phrase.targetLanguage.toLowerCase();
        return selectedLanguages.some(lang => 
          lang.toLowerCase() === sourceLang || 
          lang.toLowerCase() === targetLang
        );
      });
      
      // If we have matching phrases, use them; otherwise use all phrases
      if (filteredPhrases.length > 0) {
        newPhrases = shuffleArray(filteredPhrases);
      } else {
        newPhrases = shuffleArray(MOCK_PHRASES);
      }
    }
    
    setPhrases(newPhrases);
    
    // Reset quiz with the new phrases
    if (phrases.length > 0) {
      // Only reset if we've loaded phrases
      setCurrentQuestionIndex(0);
      setAnswered(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setOptions([]);
      setCorrectAnswerId(null);
      
      // Only reset counters if this is not the initial load
      if (correctCount > 0 || wrongCount > 0 || timeoutCount > 0) {
        setCorrectCount(0);
        setWrongCount(0);
        setTimeoutCount(0);
      }
      
      // Use setTimeout to ensure the state updates before setting up a new question
      setTimeout(() => {
        setupNewQuestion(0, startTime);
      }, 10);
    }
  }, [selectedLanguages]);

  // Set up initial question when component mounts
  useEffect(() => {
    setupNewQuestion(currentQuestionIndex, startTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Timer countdown effect
  useEffect(() => {
    // Only run the timer if not paused, time left, and not answered
    if (timeLeft > 0 && !answered && !isPaused) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          // Decrement by 1 second
          const newTime = Math.max(prev - 1, 0);
          // If timer reaches zero, handle timeout
          if (newTime === 0) {
            handleTimeUp();
          }
          return newTime;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeLeft, answered, isPaused]);
  
  // Setup a new question
  const setupNewQuestion = (index: number, currentTime: number) => {
    // Don't force scroll on mobile as it can disrupt the user experience
    // Reset states for new question
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAnswered(false);
    setUserAnswered(false); // Reset user answered flag
    
    // Set the timer - ensure it's within min/max limits
    const adjustedTime = Math.min(Math.max(currentTime, minTime), maxTime);
    setTimeLeft(adjustedTime);
    setCurrentQuestionStartTime(adjustedTime); // Save the starting time for this question
    
    console.log(`New question setup with time: ${adjustedTime}s`);
    
    // Random question type (original->translation or translation->original)
    const newQuestionType = Math.random() > 0.5 ? 'original' : 'translation';
    setQuestionType(newQuestionType);
    
    // Update current question index
    setCurrentQuestionIndex(index);
    
    // Get current phrase and 4 other random phrases for wrong answers
    const availablePhrases = shuffleArray([...phrases]);
    const currentPhrase = availablePhrases[0];
    const otherPhrases = availablePhrases.slice(1, 5);
    
    // Set up options based on question type
    let newOptions: Array<{ id: number, text: string }> = [];
    
    if (newQuestionType === 'original') {
      // Question is original Turkish phrase, options are English translations
      const correctOption = { id: currentPhrase.id, text: currentPhrase.translation };
      
      // Generate truly wrong translations that are plausible but incorrect
      const wrongOptions = [
        { id: otherPhrases[0].id, text: otherPhrases[0].translation }, // Actual wrong translation
        { id: otherPhrases[1].id, text: otherPhrases[1].translation }, // Actual wrong translation
        { id: otherPhrases[2].id, text: otherPhrases[2].translation }, // Actual wrong translation
        { id: otherPhrases[3].id, text: otherPhrases[3].translation }  // Actual wrong translation
      ];
      
      // Shuffle and combine the correct and wrong options
      newOptions = shuffleArray([correctOption, ...wrongOptions]);
      setCorrectAnswerId(currentPhrase.id);
    } else {
      // Question is English translation, options are Turkish original phrases
      const correctOption = { id: currentPhrase.id, text: currentPhrase.phrase };
      
      // Generate truly wrong phrases that are plausible but incorrect
      const wrongOptions = [
        { id: otherPhrases[0].id, text: otherPhrases[0].phrase }, // Actual wrong phrase
        { id: otherPhrases[1].id, text: otherPhrases[1].phrase }, // Actual wrong phrase
        { id: otherPhrases[2].id, text: otherPhrases[2].phrase }, // Actual wrong phrase
        { id: otherPhrases[3].id, text: otherPhrases[3].phrase }  // Actual wrong phrase
      ];
      
      // Shuffle and combine the correct and wrong options
      newOptions = shuffleArray([correctOption, ...wrongOptions]);
      setCorrectAnswerId(currentPhrase.id);
    }
    
    setOptions(newOptions);
  };
  
  // Handle when time runs out
  const handleTimeUp = () => {
    if (answered) return; // Prevent double-handling
    
    setAnswered(true);
    setIsCorrect(false); // Count as incorrect for next timer
    setTimeoutCount(prevCount => prevCount + 1); // Increment timeout counter
    
    console.log("Time up! Question not answered. Showing correct answer for 5 seconds.");
    
    // Wait 5 seconds then move to next question
    setTimeout(() => {
      const nextIndex = (currentQuestionIndex + 1) % phrases.length;
      
      // If user didn't answer, use the same time as the start of this question
      // This means no time penalty for unanswered questions
      setupNewQuestion(nextIndex, currentQuestionStartTime);
    }, 5000);
  };
  
  // Handle answer selection
  const handleAnswerClick = (optionId: number) => {
    if (answered) return; // Prevent multiple selections
    
    setSelectedAnswer(optionId);
    setAnswered(true);
    setUserAnswered(true); // User provided an answer
    
    const isAnswerCorrect = optionId === correctAnswerId;
    setIsCorrect(isAnswerCorrect);
    
    // Update correct/wrong counters
    if (isAnswerCorrect) {
      setCorrectCount(prevCount => prevCount + 1);
    } else {
      setWrongCount(prevCount => prevCount + 1);
    }
    
    console.log(`Answer selected: ${isAnswerCorrect ? 'Correct' : 'Incorrect'}. Showing result for 5 seconds.`);
    
    // Calculate next time based on correctness
    const nextTime = isAnswerCorrect
      ? Math.max(currentQuestionStartTime - 1, minTime) // Decrease if correct (based on starting time)
      : Math.min(currentQuestionStartTime + 1, maxTime); // Increase if wrong (based on starting time)
    
    // Wait 5 seconds then move to next question
    setTimeout(() => {
      const nextIndex = (currentQuestionIndex + 1) % phrases.length;
      setupNewQuestion(nextIndex, nextTime);
    }, 5000);
  };
  
  // Get current question data
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
    <div className="py-1 px-2 md:p-4 max-w-5xl mx-auto flex flex-col h-[100vh]">
      {/* Header with Counters and Timer */}
      <div className="mb-1 md:mb-3">
        <div className="flex justify-between items-center">
          {/* Performance Counters - Left side */}
          <div className="flex flex-col sm:gap-1 text-xs md:text-base">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-green-500 mr-1 md:mr-2 flex-shrink-0"></div>
              <span className="text-green-700">Correct: {correctCount}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-red-500 mr-1 md:mr-2 flex-shrink-0"></div>
              <span className="text-red-700">Wrong: {wrongCount}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-amber-500 mr-1 md:mr-2 flex-shrink-0"></div>
              <span className="text-amber-700">Timeout: {timeoutCount}</span>
            </div>
          </div>
          
          {/* Timer - Right side */}
          <PieTimer
            timeLeft={timeLeft}
            totalTime={currentQuestionStartTime}
            size={40}
            strokeWidth={3}
            className="md:scale-150 md:mr-4"
          />
        </div>
      </div>
      
      {/* Question Display */}
      <div className="bg-gray-50 rounded-lg px-2 py-1 md:p-4 mb-1 md:mb-4 shadow-sm text-center">
        {/* Current Question Language Tag */}
        <div className="flex justify-center items-center">
          <span className="inline-flex items-center px-1.5 py-0.5 md:px-3 md:py-1 rounded-md text-[10px] md:text-sm font-medium bg-primary text-white">
            {questionType === 'original' ? sourceLanguage : targetLanguage}
          </span>
          <span className="mx-1 md:mx-2 text-gray-400 text-[10px] md:text-sm">→</span>
          <span className="inline-flex items-center px-1.5 py-0.5 md:px-3 md:py-1 rounded-md text-[10px] md:text-sm font-medium bg-gray-200 text-gray-800">
            {questionType === 'original' ? targetLanguage : sourceLanguage}
          </span>
        </div>
        
        <h3 className="text-base md:text-xl font-medium break-words mt-0.5 md:mt-2">
          {question}
        </h3>
      </div>
      
      {/* Answer Options - Responsive sizing */}
      <div className="grid grid-cols-1 gap-1.5 md:gap-3 mt-1 md:mt-2 mb-1 md:mb-4">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectAnswer = option.id === correctAnswerId;
          
          let optionClassName = "relative py-1.5 px-2 md:py-3 md:px-4 border rounded-lg transition-all cursor-pointer";
          
          if (answered) {
            if (isCorrectAnswer) {
              optionClassName = "relative py-1.5 px-2 md:py-3 md:px-4 border border-green-500 bg-green-50 rounded-lg";
            } else if (isSelected && !isCorrectAnswer) {
              optionClassName = "relative py-1.5 px-2 md:py-3 md:px-4 border border-red-500 bg-red-50 rounded-lg";
            } else {
              optionClassName = "relative py-1.5 px-2 md:py-3 md:px-4 border border-gray-200 rounded-lg opacity-70";
            }
          } else {
            optionClassName = "relative py-1.5 px-2 md:py-3 md:px-4 border border-gray-200 rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
          }
          
          return (
            <div 
              key={option.id}
              className={optionClassName}
              onClick={() => handleAnswerClick(option.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-lg break-words flex-grow pr-1 md:pr-2">{option.text}</span>
                {answered && (
                  <div className="flex-shrink-0 ml-1 md:ml-2">
                    {isCorrectAnswer && (
                      <span className="inline-flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full bg-green-100">
                        <Check className="w-2.5 h-2.5 md:w-4 md:h-4 text-green-600" />
                      </span>
                    )}
                    {isSelected && !isCorrectAnswer && (
                      <span className="inline-flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full bg-red-100">
                        <X className="w-2.5 h-2.5 md:w-4 md:h-4 text-red-600" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* End Quiz Button - Fixed above mobile navigation bar */}
      <div className="pt-1 md:pt-2 border-t border-gray-100 sticky bottom-0 bg-white mt-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onComplete}
          className="w-full text-gray-500 hover:text-gray-700 text-xs md:text-base py-1 md:py-2"
        >
          Save and End the Quiz
        </Button>
      </div>
    </div>
  );
}