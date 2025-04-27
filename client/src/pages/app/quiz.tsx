import { useState } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sparkles, BookOpen, Brain } from "lucide-react";
import { 
  QUIZ_TYPES, 
  ADAPTIVE_TIME_PRESETS
} from "@/lib/constants";
import { QuizGame } from "@/components/quiz/quiz-game";

export default function Quiz() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // State to track which quiz type is selected
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  const [minTime, setMinTime] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(15);
  const [maxTime, setMaxTime] = useState<number>(30);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  
  // Handle quiz type selection
  const handleQuizTypeSelect = (quizId: string) => {
    setSelectedQuizType(quizId === selectedQuizType ? null : quizId);
  };

  // Handle time selection
  const handleMinTimeChange = (value: string) => {
    setMinTime(parseInt(value));
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(parseInt(value));
  };

  const handleMaxTimeChange = (value: string) => {
    setMaxTime(parseInt(value));
  };

  // Start quiz
  const handleStartQuiz = () => {
    if (selectedQuizType) {
      setIsQuizStarted(true);
    }
  };

  // End quiz
  const handleEndQuiz = () => {
    setIsQuizStarted(false);
  };

  // If quiz is started, show the actual quiz game
  if (isQuizStarted) {
    return (
      <div className="container mx-auto h-[calc(100vh-4rem)] px-2">
        <div className="h-full flex flex-col">
          <div className="text-2xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent mb-2">
            Quiz
          </div>
          <div className="flex-1 overflow-hidden">
            <QuizGame 
              quizType={selectedQuizType || 'mixed'} 
              minTime={minTime}
              startTime={startTime}
              maxTime={maxTime}
              onComplete={handleEndQuiz}
            />
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show the quiz setup screen
  return (
    <div className="py-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 md:pb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent mb-4">Quiz</h1>
      
      {/* Quiz Type Selection */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h3 className="text-base md:text-lg leading-6 font-medium text-gray-900 mb-3">Choose Quiz Type</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {QUIZ_TYPES.map((type) => {
              const isSelected = selectedQuizType === type.id;
              let borderColor = 'border-gray-200';
              let bgColor = '';
              
              // Apply selection styling
              if (isSelected) {
                switch(type.id) {
                  case 'learned':
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50';
                    break;
                  case 'not-learned':
                    borderColor = 'border-amber-500';
                    bgColor = 'bg-amber-50';
                    break;
                  case 'mixed':
                    borderColor = 'border-primary';
                    bgColor = 'bg-primary/5';
                    break;
                }
              }
              
              return (
                <div 
                  key={type.id} 
                  className={`
                    relative overflow-hidden rounded-lg transition-all 
                    border-2 ${borderColor} ${bgColor}
                    cursor-pointer transform
                    hover:border-primary/70 hover:bg-primary/10 hover:shadow-md 
                    ${isSelected ? 'ring-2 ring-primary/70 shadow-md scale-[1.01]' : 'shadow-sm'}
                  `}
                  onClick={() => handleQuizTypeSelect(type.id)}
                >
                  <div className="p-3 flex items-start gap-2">
                    <div className={`${type.color} h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center`}>
                      {type.id === 'learned' ? (
                        <Sparkles className="h-5 w-5 text-green-600" />
                      ) : type.id === 'not-learned' ? (
                        <BookOpen className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Brain className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <h4 className="font-semibold text-sm text-secondary truncate">{type.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{type.description}</p>
                      
                      {isSelected && (
                        <div className="mt-1 inline-flex items-center text-xs font-medium text-primary">
                          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-primary mr-1">
                            <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878-5.878 1.415-1.414L10 12.172l4.464-4.464 1.415 1.414z" />
                            </svg>
                          </span>
                          Selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Timer Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h3 className="text-base md:text-lg leading-6 font-medium text-gray-900 mb-3">Timer Settings</h3>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-3">
              The adaptive timer adjusts based on your performance. Correct answers decrease time (-1s),
              while incorrect answers increase it (+1s).
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-y-4 gap-x-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="min-time" className="flex items-center gap-1 text-sm mb-1">
                Min Time
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Speed
                </span>
              </Label>
              <Select defaultValue="5" onValueChange={handleMinTimeChange}>
                <SelectTrigger id="min-time" className="h-8 text-sm">
                  <SelectValue placeholder="Select minimum" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['3', '4', '5', '6', '7', '8', '9', '10'].includes(t.id)).map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="default-time" className="flex items-center gap-1 text-sm mb-1">
                Start Time
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Initial
                </span>
              </Label>
              <Select defaultValue="15" onValueChange={handleStartTimeChange}>
                <SelectTrigger id="default-time" className="h-8 text-sm">
                  <SelectValue placeholder="Select starting" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['10', '15', '20'].includes(t.id)).map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max-time" className="flex items-center gap-1 text-sm mb-1">
                Max Time
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Extra
                </span>
              </Label>
              <Select defaultValue="30" onValueChange={handleMaxTimeChange}>
                <SelectTrigger id="max-time" className="h-8 text-sm">
                  <SelectValue placeholder="Select maximum" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['20', '25', '30', '35', '40', '45'].includes(t.id)).map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Button 
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              disabled={!selectedQuizType}
              onClick={handleStartQuiz}
            >
              Start Quiz
            </Button>
            <p className="text-xs text-gray-500 italic">Quiz continues until you finish</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
