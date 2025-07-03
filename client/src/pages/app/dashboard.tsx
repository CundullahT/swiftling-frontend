import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Clock, Check, X, AlertCircle, Timer, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { GuardedLink } from "@/components/ui/guarded-link";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/lib/auth";
import { getConfig } from "@shared/config";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Interface for phrase data from API
interface ApiPhrase {
  externalPhraseId: string;
  originalPhrase: string;
  originalLanguage: string;
  meaning: string;
  meaningLanguage: string;
  phraseTags: string[];
  status: 'IN_PROGRESS' | 'LEARNED';
  notes?: string;
}

// Interface for progress statistics from API
interface ProgressStats {
  'total-progress': {
    learned: number;
    added: number;
  };
  'monthly-progress': {
    learned: number;
    added: number;
  };
  'weekly-progress': {
    learned: number;
    added: number;
  };
  'daily-progress': {
    learned: number;
    added: number;
  };
}

interface ProgressApiResponse {
  success: boolean;
  statusCode: string;
  message: string;
  data: ProgressStats;
}

// PieChart component
interface PieChartProps {
  data: { value: number; color: string }[];
  size?: number;
  className?: string;
  showLabels?: boolean;
}

function PieChart({ data, size = 120, className = "", showLabels = false }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate each slice's percentage of the whole
  const slices = data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }));
  
  // Calculate the SVG arc parameters
  let cumulativePercentage = 0;
  const slicesWithPaths = slices.map(slice => {
    // Convert percentages to coordinates on the circle
    const startAngle = (cumulativePercentage / 100) * 2 * Math.PI;
    cumulativePercentage += slice.percentage;
    const endAngle = (cumulativePercentage / 100) * 2 * Math.PI;
    
    // Calculate the SVG path
    const radius = size / 2;
    const startX = radius + radius * Math.sin(startAngle);
    const startY = radius - radius * Math.cos(startAngle);
    const endX = radius + radius * Math.sin(endAngle);
    const endY = radius - radius * Math.cos(endAngle);
    
    // Use the arc flag to draw the proper path depending on the angle
    const largeArcFlag = slice.percentage > 50 ? 1 : 0;
    
    // Create the SVG path
    const path = `
      M ${radius},${radius}
      L ${startX},${startY}
      A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}
      Z
    `;
    
    return {
      ...slice,
      path
    };
  });
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slicesWithPaths.map((slice, i) => (
          <path 
            key={i} 
            d={slice.path} 
            fill={slice.color} 
            stroke="white" 
            strokeWidth="1"
          />
        ))}
      </svg>
      
      {/* Center circle (optional) */}
      <div 
        className="absolute bg-white rounded-full flex items-center justify-center"
        style={{ 
          top: '25%', 
          left: '25%', 
          width: '50%', 
          height: '50%',
          boxShadow: '0 0 0 3px white'
        }}
      >
        <span className="text-sm font-semibold">{total}</span>
      </div>
      
      {/* Labels */}
      {showLabels && (
        <div className="mt-2 flex flex-col gap-1">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center text-xs">
              <div className="w-3 h-3 mr-1" style={{ backgroundColor: slice.color }}></div>
              <span>{slice.value} ({Math.round(slice.percentage)}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  // Get auth context for tokens
  const { tokens } = useAuth();
  const { toast } = useToast();
  
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // State for recent phrases
  const [recentPhrases, setRecentPhrases] = useState<ApiPhrase[]>([]);
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(true);
  const [phrasesError, setPhrasesError] = useState<string>("");
  
  // State for progress statistics
  const [progressStats, setProgressStats] = useState({
    daily: { total: 0, learned: 0 },
    weekly: { total: 0, learned: 0 },
    monthly: { total: 0, learned: 0 },
    total: { total: 0, learned: 0 }
  });
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState<string>("");
  
  // Dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<{
    id: number;
    phrase: string;
    translation: string;
    learned: boolean;
    notes?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    tags?: string[];
  } | null>(null);

  // Fetch last 10 phrases from backend
  const fetchRecentPhrases = async () => {
    if (!tokens?.access_token) return;
    
    try {
      setIsLoadingPhrases(true);
      setPhrasesError("");

      const config = await getConfig();
      const baseUrl = config.quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const phrasesUrl = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/last-ten-phrases`;
      
      console.log('Fetching recent phrases from:', phrasesUrl);
      
      const response = await fetch(phrasesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      console.log('Recent phrases response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Recent phrases response:', result);
        
        if (result.success && Array.isArray(result.data)) {
          setRecentPhrases(result.data);
        } else {
          console.error('Recent phrases fetch failed:', result.message);
          setPhrasesError(result.message || 'Failed to load recent phrases');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch recent phrases (${response.status})`;
        console.error('Recent phrases fetch error:', errorMessage);
        setPhrasesError(errorMessage);
        
        toast({
          title: "Error Loading Phrases",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching recent phrases:', error);
      const message = error instanceof Error ? error.message : 'Network error occurred';
      setPhrasesError(message);
      
      toast({
        title: "Error Loading Phrases",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPhrases(false);
    }
  };

  // Fetch recent phrases on component mount
  useEffect(() => {
    fetchRecentPhrases();
  }, [tokens?.access_token]);

  // Handle clicking on a phrase row
  const handlePhraseClick = (phrase: ApiPhrase) => {
    // Convert API phrase to dialog format
    const dialogPhrase = {
      id: Math.random(), // Generate temporary ID for dialog
      phrase: phrase.originalPhrase,
      translation: phrase.meaning,
      learned: phrase.status === 'LEARNED',
      notes: phrase.notes,
      sourceLanguage: phrase.originalLanguage.toLowerCase(),
      targetLanguage: phrase.meaningLanguage.toLowerCase(),
      tags: phrase.phraseTags
    };
    setSelectedPhrase(dialogPhrase);
    setIsDetailsDialogOpen(true);
  };
  
  // Dummy user data for UI display
  const user = {
    streakDays: 7,
    bestTime: 3.8, // Latest best time in seconds
    overallBestTime: 2.4, // Overall best time in seconds
    latestQuiz: {
      correct: 12,
      wrong: 5,
      timedOut: 3
    }
  };

  // Fetch progress statistics from backend
  const fetchProgressStats = async () => {
    if (!tokens?.access_token) return;
    
    try {
      setIsLoadingProgress(true);
      setProgressError("");

      const config = await getConfig();
      const baseUrl = config.quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const progressUrl = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/progress`;
      
      console.log('Fetching progress stats from:', progressUrl);
      
      const response = await fetch(progressUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      console.log('Progress response status:', response.status);

      if (response.status === 200) {
        const data: ProgressApiResponse = await response.json();
        console.log('Progress data received:', data);
        
        if (data.success && data.data) {
          // Map API response to component state structure
          setProgressStats({
            daily: { 
              total: data.data['daily-progress'].added, 
              learned: data.data['daily-progress'].learned 
            },
            weekly: { 
              total: data.data['weekly-progress'].added, 
              learned: data.data['weekly-progress'].learned 
            },
            monthly: { 
              total: data.data['monthly-progress'].added, 
              learned: data.data['monthly-progress'].learned 
            },
            total: { 
              total: data.data['total-progress'].added, 
              learned: data.data['total-progress'].learned 
            }
          });
        } else {
          console.error('Invalid progress data structure:', data);
          setProgressError('Invalid data received from server');
        }
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to load progress data (${response.status})`;
        console.error('Progress fetch error:', errorData);
        setProgressError(errorMessage);
        
        toast({
          title: "Error Loading Progress",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      const message = error instanceof Error ? error.message : 'Network error occurred';
      setProgressError(message);
      
      toast({
        title: "Error Loading Progress",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRecentPhrases();
    fetchProgressStats();
  }, [tokens]);





  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent leading-tight py-1">Dashboard</h1>
        <GuardedLink href="/add-phrase">
          <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Phrase</span>
          </Button>
        </GuardedLink>
      </div>

      
      {/* Stats Card with Daily Streak, Best Time, and Latest Quiz Results */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Daily Streak */}
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-secondary">Daily Streak</h2>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight py-1">{user.streakDays} days</p>
              </div>
            </div>
            
            {/* Overall Best Time */}
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-secondary">Overall Best Time</h2>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-transparent leading-tight py-1">{Math.round(user.overallBestTime)}s</p>
              </div>
            </div>
            
            {/* Latest Best Time */}
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-secondary">Latest Best Time</h2>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight py-1">{Math.round(user.bestTime)}s</p>
              </div>
            </div>
            
            {/* Latest Result */}
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-secondary">Latest Result</h2>
                <div className="flex items-center gap-3 mt-1">
                  {/* Correct */}
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-lg font-bold text-green-600">{user.latestQuiz.correct}</span>
                  </div>
                  
                  {/* Wrong */}
                  <div className="flex items-center">
                    <X className="h-4 w-4 text-rose-600 mr-1" />
                    <span className="text-lg font-bold text-rose-600">{user.latestQuiz.wrong}</span>
                  </div>
                  
                  {/* Timed Out */}
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
                    <span className="text-lg font-bold text-amber-600">{user.latestQuiz.timedOut}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Progress Statistics */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">Progress Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Daily Progress */}
            <div className="bg-primary/5 rounded-lg p-4 shadow-sm border border-primary/10">
              <h3 className="text-sm font-medium text-secondary mb-2">Daily Progress</h3>
              <div className="flex flex-col items-center">
                <PieChart 
                  data={[
                    { value: progressStats.daily.learned, color: 'hsl(var(--primary))' }, // Primary teal for learned
                    { value: progressStats.daily.total - progressStats.daily.learned, color: 'hsl(var(--muted))' } // Muted for not learned
                  ]}
                  size={100}
                />
                <div className="mt-3 flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-secondary/70">Added</p>
                    <p className="text-lg font-semibold text-secondary">{progressStats.daily.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary/70">Learned</p>
                    <p className="text-lg font-semibold text-primary">{progressStats.daily.learned}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weekly Progress */}
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 shadow-sm border border-primary/10">
              <h3 className="text-sm font-medium text-secondary mb-2">Weekly Progress</h3>
              <div className="flex flex-col items-center">
                <PieChart 
                  data={[
                    { value: progressStats.weekly.learned, color: '#FFA726' }, // Orange color as requested
                    { value: progressStats.weekly.total - progressStats.weekly.learned, color: 'hsl(var(--muted))' } // Gray like other charts for non-learned
                  ]}
                  size={100}
                />
                <div className="mt-3 flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-secondary/70">Added</p>
                    <p className="text-lg font-semibold text-secondary">{progressStats.weekly.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary/70">Learned</p>
                    <p className="text-lg font-semibold" style={{ color: '#FFA726' }}>{progressStats.weekly.learned}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Monthly Progress */}
            <div className="bg-accent/5 rounded-lg p-4 shadow-sm border border-primary/10">
              <h3 className="text-sm font-medium text-secondary mb-2">Monthly Progress</h3>
              <div className="flex flex-col items-center">
                <PieChart 
                  data={[
                    { value: progressStats.monthly.learned, color: 'hsl(var(--accent))' }, // Accent/gold for learned
                    { value: progressStats.monthly.total - progressStats.monthly.learned, color: 'hsl(var(--muted))' } // Muted for not learned
                  ]}
                  size={100}
                />
                <div className="mt-3 flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-secondary/70">Added</p>
                    <p className="text-lg font-semibold text-secondary">{progressStats.monthly.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary/70">Learned</p>
                    <p className="text-lg font-semibold text-accent">{progressStats.monthly.learned}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Progress */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 shadow-sm border border-primary/10">
              <h3 className="text-sm font-medium text-secondary mb-2">Total Progress</h3>
              <div className="flex flex-col items-center">
                <PieChart 
                  data={[
                    { value: progressStats.total.learned, color: 'hsl(var(--chart-5))' }, // Mint green for learned
                    { value: progressStats.total.total - progressStats.total.learned, color: 'hsl(var(--muted))' } // Muted for not learned
                  ]}
                  size={100}
                />
                <div className="mt-3 flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-secondary/70">Added</p>
                    <p className="text-lg font-semibold text-secondary">{progressStats.total.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary/70">Learned</p>
                    <p className="text-lg font-semibold text-chart-5">{progressStats.total.learned}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Phrases */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">Last 10 Phrases Added</h2>
          <div className="overflow-hidden">
            <div className="overflow-x-auto relative w-full">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="border-b border-primary/10">
                    <TableHead className="w-[37%] text-secondary">Phrase</TableHead>
                    <TableHead className="w-[37%] text-secondary">Translation</TableHead>
                    <TableHead className="w-[26%] text-secondary text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPhrases ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Loading recent phrases...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : phrasesError ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-red-500">
                        Error loading phrases: {phrasesError}
                      </TableCell>
                    </TableRow>
                  ) : recentPhrases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        No recent phrases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPhrases.map((phrase) => (
                      <TableRow 
                        key={phrase.externalPhraseId} 
                        onClick={() => handlePhraseClick(phrase)}
                        className="cursor-pointer hover:bg-secondary/5 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="line-clamp-2 overflow-hidden break-words">{phrase.originalPhrase}</div>
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-2 overflow-hidden break-words">{phrase.meaning}</div>
                        </TableCell>
                        <TableCell className="text-right sm:whitespace-nowrap">
                          {phrase.status === 'LEARNED' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                              Learned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                              In&nbsp;Progress
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phrase Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-primary">{selectedPhrase?.phrase}</span>
              <span className="text-sm font-normal text-gray-500">({selectedPhrase?.translation})</span>
            </DialogTitle>
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Languages:</h3>
              <div className="flex gap-2 items-center">
                <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700">
                  {selectedPhrase && selectedPhrase.sourceLanguage ? 
                    selectedPhrase.sourceLanguage.charAt(0).toUpperCase() + selectedPhrase.sourceLanguage.slice(1) :
                    "Unknown"
                  }
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700">
                  {selectedPhrase && selectedPhrase.targetLanguage ? 
                    selectedPhrase.targetLanguage.charAt(0).toUpperCase() + selectedPhrase.targetLanguage.slice(1) :
                    "Unknown"
                  }
                </Badge>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Status:</h3>
              <div>
                {selectedPhrase?.learned ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                    Learned
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    In&nbsp;Progress
                  </span>
                )}
              </div>
            </div>
            
            {/* Tags section */}
            {selectedPhrase?.tags && selectedPhrase.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPhrase.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 text-accent-foreground border-accent/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {selectedPhrase?.notes && (
              <>
                <h3 className="text-sm font-medium mb-2">Notes:</h3>
                <p className="text-gray-700">{selectedPhrase.notes}</p>
              </>
            )}
            {!selectedPhrase?.notes && (
              <p className="text-gray-500 italic">No additional notes available for this phrase.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
