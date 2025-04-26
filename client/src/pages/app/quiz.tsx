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

export default function Quiz() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // State to track which quiz type is selected
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  
  // Handle quiz type selection
  const handleQuizTypeSelect = (quizId: string) => {
    setSelectedQuizType(quizId === selectedQuizType ? null : quizId);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent mb-6">Quiz</h1>
      
      {/* Quiz Type Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Choose Quiz Type</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    ${isSelected ? 'ring-2 ring-primary/70 shadow-md scale-[1.02]' : 'shadow-sm'}
                  `}
                  onClick={() => handleQuizTypeSelect(type.id)}
                >
                  <div className="p-4 flex items-start gap-3">
                    <div className={`${type.color} h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center`}>
                      {type.id === 'learned' ? (
                        <Sparkles className="h-6 w-6 text-green-600" />
                      ) : type.id === 'not-learned' ? (
                        <BookOpen className="h-6 w-6 text-amber-600" />
                      ) : (
                        <Brain className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <h4 className="font-semibold text-sm sm:text-base text-secondary truncate">{type.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{type.description}</p>
                      
                      {isSelected && (
                        <div className="mt-2 inline-flex items-center text-xs font-medium text-primary">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary mr-1.5">
                            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Adaptive Timer Settings</h3>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              The quiz uses an adaptive timer that adjusts based on your performance. Correct answers decrease time,
              while incorrect answers increase it, within the limits you set below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="min-time" className="flex items-center gap-2">
                Minimum Time Limit
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  For speed
                </span>
              </Label>
              <Select defaultValue="5">
                <SelectTrigger id="min-time">
                  <SelectValue placeholder="Select minimum time" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['3', '4', '5', '6', '7', '8', '9', '10'].includes(t.id)).map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                The timer won't go below this limit, even after consecutive correct answers.
              </p>
            </div>

            <div>
              <Label htmlFor="default-time" className="flex items-center gap-2">
                Starting Time Limit
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Initial time
                </span>
              </Label>
              <Select defaultValue="15">
                <SelectTrigger id="default-time">
                  <SelectValue placeholder="Select starting time" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['15', '20'].includes(t.id)).map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Time limit for the first question and after restarting the quiz.
              </p>
            </div>

            <div>
              <Label htmlFor="max-time" className="flex items-center gap-2">
                Maximum Time Limit
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Extra time
                </span>
              </Label>
              <Select defaultValue="30">
                <SelectTrigger id="max-time">
                  <SelectValue placeholder="Select maximum time" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['20', '25', '30', '35', '40', '45'].includes(t.id)).map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                The timer won't go above this limit, even after consecutive wrong answers.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Button 
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              disabled={!selectedQuizType}
            >
              Start Quiz
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 italic">Quiz continues until you choose to finish</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
