import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { useGuardedNavigation } from "@/hooks/use-guarded-navigation";
import { GuardedLink } from "@/components/ui/guarded-link";
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
import { useQuiz } from "@/context/quiz-context";
import { 
  AlertDialog,
  AlertDialogContent, 
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { getConfig } from "@shared/config";

// Phrase interface matching backend response
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

// API function to fetch quiz languages
const getQuizLanguages = async (accessToken: string) => {
  const config = await getConfig();
  const baseUrl = config.quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
  const phrasesUrl = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/quiz-languages`;
  const response = await fetch(phrasesUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch quiz languages');
  }

  const data = await response.json();
  return data.data || [];
};

// API function to fetch phrases for quiz
const getQuizPhrases = async (accessToken: string, status?: string, langCode?: string) => {
  const config = await getConfig();
  
  // Build query parameters only when needed
  const queryParams = new URLSearchParams();
  if (status) {
    queryParams.append('status', status);
  }
  if (langCode) {
    queryParams.append('langCode', langCode);
  }
  
  const queryString = queryParams.toString();
  const baseUrl = config.quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
  const url = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/phrases${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch quiz phrases');
  }

  const data = await response.json();
  return data.data || [];
};

// API function to fetch all user phrases for count validation
const getAllUserPhrases = async (accessToken: string): Promise<any[]> => {
  const config = await getConfig();
  const baseUrl = config.quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
  const response = await fetch(`${baseUrl}/swiftling-phrase-service/api/v1/phrase/phrases`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user phrases');
  }

  const data = await response.json();
  return data.data || [];
};

// Function to convert backend response to Phrase object
const createPhraseFromResponse = (responsePhrase: any): Phrase => {
  return {
    originalPhrase: responsePhrase.originalPhrase,
    originalLanguage: responsePhrase.originalLanguage,
    meaning: responsePhrase.meaning,
    meaningLanguage: responsePhrase.meaningLanguage,
    phraseTags: responsePhrase.phraseTags || [],
    status: responsePhrase.status,
    notes: responsePhrase.notes || '',
    consecutiveCorrectAmount: 0,
    answeredWrongOrTimedOutAtLeastOnce: false
  };
};

export default function Quiz() {
  // Scroll to top when navigating to this page
  useScrollTop();
  
  // For navigating to Add Phrase page
  const [, setLocation] = useLocation();
  
  // Use the quiz context to set the global quiz active state
  const { setQuizActive, pauseQuiz, unpauseQuiz } = useQuiz();
  
  // State to track which quiz type is selected
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  const [minTime, setMinTime] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(15);
  const [maxTime, setMaxTime] = useState<number>(30);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  
  // State for available languages from backend
  const [availableLanguages, setAvailableLanguages] = useState<typeof LANGUAGES>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  
  // State for phrase count validation
  const [userPhraseCount, setUserPhraseCount] = useState<number>(0);
  const [isLoadingPhraseCount, setIsLoadingPhraseCount] = useState(true);
  const [hasMinimumPhrases, setHasMinimumPhrases] = useState(false);
  
  // State for quiz phrases Map
  const [quizPhrases, setQuizPhrases] = useState<Map<string, Phrase>>(new Map());
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(false);
  
  // Toast for error messages
  const { toast } = useToast();
  
  // State for navigation dialog
  const [showNavDialog, setShowNavDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Fetch available languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoadingLanguages(true);
        const tokens = authService.getTokens();
        
        if (!tokens?.access_token) {
          throw new Error('No access token available');
        }
        
        const userLanguageNames = await getQuizLanguages(tokens.access_token);
        
        // Filter LANGUAGES array to only include languages the user has added
        const filteredLanguages = LANGUAGES.filter(language => 
          userLanguageNames.includes(language.name)
        );
        
        setAvailableLanguages(filteredLanguages);
      } catch (error) {
        console.error('Failed to fetch quiz languages:', error);
        toast({
          title: "Error",
          description: "Failed to load available languages. Please try again.",
          variant: "destructive",
        });
        // Set empty array if fetch fails
        setAvailableLanguages([]);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    
    fetchLanguages();
  }, [toast]);
  
  // Fetch user phrase count on component mount
  useEffect(() => {
    const fetchPhraseCount = async () => {
      try {
        setIsLoadingPhraseCount(true);
        const tokens = authService.getTokens();
        
        if (!tokens?.access_token) {
          throw new Error('No access token available');
        }
        
        const userPhrases = await getAllUserPhrases(tokens.access_token);
        const count = userPhrases.length;
        
        setUserPhraseCount(count);
        setHasMinimumPhrases(count >= 10);
      } catch (error) {
        console.error('Failed to fetch user phrases:', error);
        toast({
          title: "Error",
          description: "Failed to load your phrases. Please try again.",
          variant: "destructive",
        });
        // Set to 0 if fetch fails
        setUserPhraseCount(0);
        setHasMinimumPhrases(false);
      } finally {
        setIsLoadingPhraseCount(false);
      }
    };
    
    fetchPhraseCount();
  }, [toast]);
  
  // Set up guarded navigation
  const navigationBlockConfig = useMemo(() => ({
    isBlocked: isQuizStarted,
    onBlock: (destination: string) => {
      pauseQuiz();
      setPendingNavigation(destination);
      setShowNavDialog(true);
    }
  }), [isQuizStarted, pauseQuiz]);
  
  const { navigate: guardedNavigate } = useGuardedNavigation(navigationBlockConfig);
  
  // Handle continue quiz (stay on page)
  const handleContinueQuiz = () => {
    setShowNavDialog(false);
    setPendingNavigation(null);
    unpauseQuiz();
  };
  
  // Handle proceed with navigation
  const handleLeaveQuiz = () => {
    if (pendingNavigation) {
      // Reset both local and global quiz states
      setIsQuizStarted(false);
      setQuizActive(false); // This is the critical line that was missing
      setLocation(pendingNavigation);
    }
    setShowNavDialog(false);
  };
  
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Mock phrase data - replace with actual API call later
  const [phrases, setPhrases] = useState<any[]>([]);
  
  // Function to check phrase count and determine what to show
  const getPhraseStatus = () => {
    const count = userPhraseCount;
    if (count === 0) {
      return { type: 'no-phrases', count };
    } else if (count < 10) {
      return { type: 'insufficient-phrases', count };
    } else {
      return { type: 'sufficient-phrases', count };
    }
  };
  
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
  
  // Filter languages based on search query from available languages
  const filteredLanguages = availableLanguages.filter(language => 
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

  // Function to fetch phrases for quiz
  const fetchQuizPhrases = async () => {
    const tokens = authService.getTokens();
    if (!tokens?.access_token) {
      throw new Error('No access token available');
    }

    const phrasesMap = new Map<string, Phrase>();
    
    // Check if "All Languages" is selected
    const isAllLanguages = selectedLanguages.includes('all') || selectedLanguages.length === 0;
    
    // Determine which languages to fetch from
    const languagesToFetch = isAllLanguages
      ? availableLanguages
      : availableLanguages.filter(lang => selectedLanguages.includes(lang.id));

    // Determine which statuses to fetch based on quiz type
    let statusesToFetch: (string | undefined)[] = [];
    if (selectedQuizType === 'learned') {
      statusesToFetch = ['LEARNED'];
    } else if (selectedQuizType === 'not-learned') {
      statusesToFetch = ['IN_PROGRESS'];
    } else { // mixed - fetch all statuses
      statusesToFetch = [undefined]; // No status parameter means all statuses
    }

    // Handle "All Languages" case - make single request without langCode
    if (isAllLanguages) {
      for (const status of statusesToFetch) {
        try {
          const phrasesData = await getQuizPhrases(tokens.access_token, status, undefined);
          
          // Convert each phrase and add to map
          phrasesData.forEach((phraseData: any) => {
            const phrase = createPhraseFromResponse(phraseData);
            phrasesMap.set(phraseData.externalPhraseId, phrase);
          });
        } catch (error) {
          console.error(`Failed to fetch phrases for all languages (${status || 'all statuses'}):`, error);
        }
      }
    } else {
      // Fetch phrases for each combination of language and status
      for (const language of languagesToFetch) {
        for (const status of statusesToFetch) {
          try {
            const phrasesData = await getQuizPhrases(tokens.access_token, status, language.id);
            
            // Convert each phrase and add to map
            phrasesData.forEach((phraseData: any) => {
              const phrase = createPhraseFromResponse(phraseData);
              phrasesMap.set(phraseData.externalPhraseId, phrase);
            });
          } catch (error) {
            console.error(`Failed to fetch phrases for ${language.name} (${status || 'all statuses'}):`, error);
            // Continue with other combinations even if one fails
          }
        }
      }
    }

    return phrasesMap;
  };

  // Start quiz
  const handleStartQuiz = async () => {
    if (!selectedQuizType) {
      toast({
        title: "Selection Required",
        description: "Please select a quiz type before starting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingPhrases(true);
      
      // Fetch phrases from backend
      const phrasesMap = await fetchQuizPhrases();
      
      if (phrasesMap.size === 0) {
        toast({
          title: "No Phrases Found",
          description: "No phrases found for the selected criteria. Please try different options or add more phrases.",
          variant: "destructive",
        });
        return;
      }

      // Store phrases in state
      setQuizPhrases(phrasesMap);
      
      // Scroll to top before starting the quiz
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Set both local and global quiz state to active
      setIsQuizStarted(true);
      setQuizActive(true);
      
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast({
        title: "Quiz Start Failed",
        description: "Failed to load quiz phrases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPhrases(false);
    }
  };

  // End quiz
  const handleEndQuiz = () => {
    // Reset both local and global quiz state
    setIsQuizStarted(false);
    setQuizActive(false);
  };

  // Show loading state while fetching phrase count or languages
  if (isLoadingPhraseCount || isLoadingLanguages) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent leading-tight py-1">Quiz</h1>
          <GuardedLink href="/quiz-history">
            <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>View Quiz History</span>
            </Button>
          </GuardedLink>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-secondary/70">Loading quiz setup...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If quiz is started, show the actual quiz game
  if (isQuizStarted) {
    return (
      <>
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
                quizPhrases={quizPhrases}
              />
            </div>
          </div>
        </div>
        
        {/* Navigation Guard Dialog */}
        <AlertDialog open={showNavDialog} onOpenChange={setShowNavDialog}>
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
                onClick={handleContinueQuiz}
                className="sm:flex-1"
              >
                Continue Quiz
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleLeaveQuiz}
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

  // Get current phrase status
  const phraseStatus = getPhraseStatus();
  
  // Show appropriate empty state based on phrase count
  if (phraseStatus.type !== 'sufficient-phrases') {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent leading-tight py-1">Quiz</h1>
          <GuardedLink href="/quiz-history">
            <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>View Quiz History</span>
            </Button>
          </GuardedLink>
        </div>
        
        {/* No phrases state */}
        {phraseStatus.type === 'no-phrases' && (
          <Card className="mb-6">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-2">No Phrases Added Yet</h3>
                <p className="text-secondary/70 mb-6 max-w-md">
                  You need to add phrases before you can start a quiz. Add your first phrase to begin your language learning journey!
                </p>
                <GuardedLink href="/add-phrase">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Phrase
                  </Button>
                </GuardedLink>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Insufficient phrases state */}
        {phraseStatus.type === 'insufficient-phrases' && (
          <Card className="mb-6">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-2">Almost Ready for Quiz!</h3>
                <p className="text-secondary/70 mb-6 max-w-md">
                  You have {phraseStatus.count} phrase{phraseStatus.count !== 1 ? 's' : ''}, but need at least 10 phrases to create a meaningful quiz experience. Add {10 - phraseStatus.count} more phrase{10 - phraseStatus.count !== 1 ? 's' : ''} to get started!
                </p>
                <GuardedLink href="/add-phrase">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add More Phrases
                  </Button>
                </GuardedLink>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Otherwise show the quiz setup screen
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent leading-tight py-1">Quiz</h1>
        <GuardedLink href="/quiz-history">
          <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>View Quiz History</span>
          </Button>
        </GuardedLink>
      </div>
      
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
                      placeholder="Select a Language"
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
                      
                      {/* Loading state */}
                      {isLoadingLanguages ? (
                        <div className="px-4 py-2 text-gray-500">
                          Loading languages...
                        </div>
                      ) : (
                        <>
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
                          ) : availableLanguages.length === 0 ? (
                            <div className="px-4 py-2 text-gray-500">
                              No languages available. Add phrases to see language options.
                            </div>
                          ) : null}
                        </>
                      )}
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
              The quiz uses an adaptive timer that adjusts based on your performance. Correct answers decrease time by 1 second,
              while incorrect answers increase it by 1 second, within the limits you set below.
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
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(t.id)).map((time) => (
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
              disabled={!selectedQuizType || selectedLanguages.length === 0 || isLoadingPhrases}
              onClick={handleStartQuiz}
            >
              {isLoadingPhrases ? "Loading Phrases..." : "Start Quiz"}
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 italic">
              {!selectedQuizType && selectedLanguages.length === 0 ? (
                "Select a quiz type and a language to continue"
              ) : !selectedQuizType ? (
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
