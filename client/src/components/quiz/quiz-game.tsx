import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { PieTimer } from "./pie-timer";

// Turkish-English phrases
const MOCK_PHRASES = [
  { id: 1, phrase: "Merhaba", translation: "Hello", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 2, phrase: "Hoşça kal", translation: "Goodbye", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 3, phrase: "Teşekkür ederim", translation: "Thank you", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 4, phrase: "Lütfen", translation: "Please", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 5, phrase: "Özür dilerim", translation: "I'm sorry", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 6, phrase: "Günaydın", translation: "Good morning", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 7, phrase: "İyi geceler", translation: "Good night", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 8, phrase: "Nasılsın?", translation: "How are you?", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 9, phrase: "Anlamıyorum", translation: "I don't understand", sourceLanguage: "Turkish", targetLanguage: "English" },
  { id: 10, phrase: "Nerede...", translation: "Where is...", sourceLanguage: "Turkish", targetLanguage: "English" },
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
}

export function QuizGame({ quizType, minTime, startTime, maxTime, onComplete }: QuizGameProps) {
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
  
  // Set up initial question when component mounts
  useEffect(() => {
    setupNewQuestion(currentQuestionIndex, startTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && !answered) {
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
  }, [timeLeft, answered]);
  
  // Setup a new question
  const setupNewQuestion = (index: number, currentTime: number) => {
    // Scroll to top of the page for the new question
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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
    <div className="py-2 px-3 max-w-5xl mx-auto flex flex-col h-full">
      {/* Compact Header with Counters and Timer */}
      <div className="mb-3">
        <div className="flex justify-between mb-2">
          {/* Performance Counters - Left side, stacked vertically */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1 flex-shrink-0"></div>
              <span className="text-green-700">Correct: {correctCount}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1 flex-shrink-0"></div>
              <span className="text-red-700">Wrong: {wrongCount}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-1 flex-shrink-0"></div>
              <span className="text-amber-700">Timeout: {timeoutCount}</span>
            </div>
          </div>
          
          {/* Timer - Right side */}
          <PieTimer
            timeLeft={timeLeft}
            totalTime={currentQuestionStartTime}
            size={50}
            strokeWidth={4}
          />
        </div>
      </div>
      
      {/* Streamlined Question Display */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 mb-3 shadow-sm text-center">
        <h3 className="text-lg font-medium break-words">
          {question}
        </h3>
      </div>
      
      {/* Answer Options - More Compact */}
      <div className="space-y-2 flex-grow overflow-y-auto">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectAnswer = option.id === correctAnswerId;
          
          let optionClassName = "relative py-2 px-3 border rounded-lg transition-all cursor-pointer";
          
          if (answered) {
            if (isCorrectAnswer) {
              optionClassName = "relative py-2 px-3 border border-green-500 bg-green-50 rounded-lg";
            } else if (isSelected && !isCorrectAnswer) {
              optionClassName = "relative py-2 px-3 border border-red-500 bg-red-50 rounded-lg";
            } else {
              optionClassName = "relative py-2 px-3 border border-gray-200 rounded-lg opacity-70";
            }
          } else {
            optionClassName = "relative py-2 px-3 border border-gray-200 rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
          }
          
          return (
            <div 
              key={option.id}
              className={optionClassName}
              onClick={() => handleAnswerClick(option.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm break-words flex-grow">{option.text}</span>
                {answered && (
                  <div className="flex-shrink-0 ml-2">
                    {isCorrectAnswer && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
                        <Check className="w-3 h-3 text-green-600" />
                      </span>
                    )}
                    {isSelected && !isCorrectAnswer && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                        <X className="w-3 h-3 text-red-600" />
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
      <div className="mt-3 pt-2 mb-2 border-t border-gray-100">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onComplete}
          className="w-full text-gray-500 hover:text-gray-700"
        >
          End Quiz
        </Button>
      </div>
    </div>
  );
}