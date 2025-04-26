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
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {/* Timer and Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1}
        </div>
        <div className="flex items-center">
          <PieTimer
            timeLeft={timeLeft}
            totalTime={startTime} // Use start time as reference
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
          
          let optionClassName = "relative p-4 border-2 rounded-lg transition-all cursor-pointer";
          
          if (answered) {
            if (isCorrectAnswer) {
              optionClassName = "relative p-4 border-2 border-green-500 bg-green-50 rounded-lg";
            } else if (isSelected && !isCorrectAnswer) {
              optionClassName = "relative p-4 border-2 border-red-500 bg-red-50 rounded-lg";
            } else {
              optionClassName = "relative p-4 border-2 border-gray-200 rounded-lg opacity-70";
            }
          } else {
            optionClassName = "relative p-4 border-2 border-gray-200 rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
          }
          
          return (
            <div 
              key={option.id}
              className={optionClassName}
              onClick={() => handleAnswerClick(option.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-base">{option.text}</span>
                {answered && (
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