import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sparkles, BookOpen, Brain, PlusCircle, Search, X } from "lucide-react";
import { 
  QUIZ_TYPES, 
  ADAPTIVE_TIME_PRESETS,
  LANGUAGES
} from "@/lib/constants";
import { QuizGame } from "@/components/quiz/quiz-game";

export default function Quiz() {
  // Scroll to top when navigating to this page
  useScrollTop();
  
  // For navigating to Add Phrase page
  const [, setLocation] = useLocation();
  
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Placeholder function to check if user has added any phrases
  // In a real app, this would be a database query or API call
  const hasPhrases = () => {
    // For the prototype, you can set this to false to test the empty state
    return true; // Set to false to show the empty state message, true to show the quiz setup
  };
  
  // State to track which quiz type is selected
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  const [minTime, setMinTime] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(15);
  const [maxTime, setMaxTime] = useState<number>(30);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  
  // State for language selection
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageInputRef = useRef<HTMLInputElement>(null);
  
  // Handle language selection
  const handleLanguageSelect = (languageId: string) => {
    if (languageId === 'all') {
      // If selecting "All Languages", that's the only option we can have
      setSelectedLanguages(['all']);
    } else {
      // If selecting a specific language, remove 'all' if it's selected
      let newSelection = [...selectedLanguages];
      if (newSelection.includes('all')) {
        newSelection = newSelection.filter(id => id !== 'all');
      }

      // Add the language if it's not already selected
      if (!newSelection.includes(languageId)) {
        newSelection.push(languageId);
      }

      setSelectedLanguages(newSelection);
    }
    setSearchQuery('');
    
    // Focus back on the input after selection
    if (languageInputRef.current) {
      languageInputRef.current.focus();
    }
  };
  
  // Remove a selected language
  const removeLanguage = (languageId: string) => {
    setSelectedLanguages(selectedLanguages.filter(id => id !== languageId));
  };
  
  // Filter languages based on search query
  const filteredLanguages = LANGUAGES.filter(language => 
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !selectedLanguages.includes(language.id)
  );
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
      // Scroll to top before starting the quiz
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="container mx-auto h-[calc(100vh-8rem)] px-2 pb-16 md:pb-2">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <QuizGame 
              quizType={selectedQuizType || 'mixed'} 
              minTime={minTime}
              startTime={startTime}
              maxTime={maxTime}
              onComplete={handleEndQuiz}
              selectedLanguages={selectedLanguages}
            />
          </div>
        </div>
      </div>
    );
  }

  // Check if user has phrases, if not - show the empty state message
  if (!hasPhrases()) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
        <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent mb-6">Quiz</h1>
        
        {/* No phrases yet message */}
        <Card className="mb-6 border-2 border-dashed border-gray-200">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Phrases Available</h3>
            <p className="text-gray-500 max-w-md mb-6">
              You need to add at least one phrase before you can start a quiz. Add your first phrase to begin practicing!
            </p>
            <Button
              onClick={() => setLocation('/add-phrase')}
              size="lg"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Your First Phrase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Otherwise show the quiz setup screen
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

      {/* Language Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Language Selection
          </h3>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              Select which language you want to practice in the quiz. Only languages that you've used 
              while adding phrases will be available for practice.
            </p>
            
            {/* Language Tags Input */}
            <div>
              {/* Selected languages display */}
              <div className="flex flex-wrap gap-2 mb-2 mt-2">
                {selectedLanguages.length === 0 ? (
                  <p className="text-xs text-gray-500">No languages selected</p>
                ) : selectedLanguages.includes('all') ? (
                  <Badge 
                    className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                  >
                    All Languages
                    <button
                      type="button"
                      onClick={() => removeLanguage('all')}
                      className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : (
                  selectedLanguages.map(langId => {
                    const language = LANGUAGES.find(l => l.id === langId);
                    return (
                      <Badge 
                        key={langId} 
                        className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                      >
                        {language?.name || langId}
                        <button
                          type="button"
                          onClick={() => removeLanguage(langId)}
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
                )}
              </div>
              
              {/* Language search input */}
              <div className="relative">
                <div className="flex items-center">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      ref={languageInputRef}
                      placeholder="Search languages or type 'all' for all languages..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!showLanguageDropdown) setShowLanguageDropdown(true);
                      }}
                      onFocus={() => setShowLanguageDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLanguageDropdown(false), 200)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Dropdown for language selection */}
                {showLanguageDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                    <div className="divide-y divide-gray-200">
                      {/* "All Languages" option always appears first */}
                      {!selectedLanguages.includes('all') && (
                        <div
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => handleLanguageSelect('all')}
                        >
                          <span className="font-medium">All Languages</span>
                        </div>
                      )}
                      
                      {/* Filtered languages */}
                      {filteredLanguages.length > 0 ? (
                        filteredLanguages.map((language) => (
                          <div
                            key={language.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleLanguageSelect(language.id)}
                          >
                            <span>{language.name}</span>
                          </div>
                        ))
                      ) : searchQuery && !searchQuery.toLowerCase().includes('all') ? (
                        <div className="px-4 py-2 text-gray-500">
                          No matching languages found
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Select multiple languages or choose "All Languages" to practice with phrases from all available languages
              </p>
            </div>
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
              <Select defaultValue="5" onValueChange={handleMinTimeChange}>
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
              <Select defaultValue="15" onValueChange={handleStartTimeChange}>
                <SelectTrigger id="default-time">
                  <SelectValue placeholder="Select starting time" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['10', '15', '20'].includes(t.id)).map((time) => (
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
              <Select defaultValue="30" onValueChange={handleMaxTimeChange}>
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
              disabled={!selectedQuizType || selectedLanguages.length === 0}
              onClick={handleStartQuiz}
            >
              Start Quiz
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 italic">
              {!selectedQuizType ? (
                "Select a quiz type to continue"
              ) : selectedLanguages.length === 0 ? (
                "Select at least one language to continue"
              ) : (
                "Quiz continues until you choose to finish"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
