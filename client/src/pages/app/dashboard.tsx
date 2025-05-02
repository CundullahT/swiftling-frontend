import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Clock, Check, X, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { GuardedLink } from "@/components/ui/guarded-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
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

  // Handle clicking on a phrase row
  const handlePhraseClick = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsDetailsDialogOpen(true);
  };
  
  // Dummy user data for UI display
  const user = {
    streakDays: 7,
    bestTime: 3.8, // Best time in seconds
    latestQuiz: {
      correct: 12,
      wrong: 5,
      timedOut: 3
    }
  };

  // Dummy data for progress metrics
  const progressStats = {
    daily: { total: 5, learned: 3 },
    weekly: { total: 18, learned: 12 },
    monthly: { total: 45, learned: 32 },
    total: { total: 120, learned: 85 }
  };

  // Last 10 phrases data from My List (id 41-50), converted to use learned flag instead of proficiency
  const recentPhrases = [
    { 
      id: 41, 
      phrase: 'Здравствуйте (Zdravstvuyte)', 
      translation: 'Hello', 
      learned: false, // Converted from proficiency 60
      tags: ['Greetings', 'Beginner'], 
      notes: 'Formal greeting. "Привет" (Privet) is the informal version.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 42, 
      phrase: 'Как дела? (Kak dela?)', 
      translation: 'How are you?', 
      learned: false, // Converted from proficiency 65
      tags: ['Greetings', 'Questions', 'Beginner'], 
      notes: 'The common way to ask how someone is doing.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 43, 
      phrase: 'Спасибо (Spasibo)', 
      translation: 'Thank you', 
      learned: true, // Converted from proficiency 80
      tags: ['Common phrases', 'Beginner'], 
      notes: 'Basic way to express thanks in Russian.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 44, 
      phrase: 'Пожалуйста (Pozhaluysta)', 
      translation: 'Please/You\'re welcome', 
      learned: false, // Converted from proficiency 70
      tags: ['Common phrases', 'Beginner'], 
      notes: 'Like German "bitte", this can mean both "please" and "you\'re welcome".',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 45, 
      phrase: 'Извините (Izvinite)', 
      translation: 'I\'m sorry/Excuse me', 
      learned: false, // Converted from proficiency 55
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      notes: 'Formal way to apologize or get someone\'s attention.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 46, 
      phrase: '안녕하세요 (Annyeong haseyo) - 만나서 반갑습니다. 저는 한국어를 공부하고 있습니다. 천천히 말해 주세요.', 
      translation: 'Hello - Nice to meet you. I am studying Korean. Please speak slowly.', 
      learned: false, // Converted from proficiency 75
      tags: ['Greetings', 'Beginner'], 
      notes: 'Standard greeting in Korean. "안녕" (Annyeong) is casual. Extended with useful phrases for language learners when meeting native speakers.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 47, 
      phrase: '어떻게 지내세요? (Eotteoke jinaeseyo?)', 
      translation: 'How are you?', 
      learned: false, // Converted from proficiency 50
      tags: ['Greetings', 'Questions', 'Intermediate'], 
      notes: 'Formal way to ask how someone has been doing.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 48, 
      phrase: '감사합니다 (Gamsahamnida)', 
      translation: 'Thank you', 
      learned: true, // Converted from proficiency 85
      tags: ['Common phrases', 'Beginner'], 
      notes: 'Formal way to say thank you. "고마워" (Gomawo) is casual.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 49, 
      phrase: '주세요 (Juseyo)', 
      translation: 'Please give me', 
      learned: false, // Converted from proficiency 70
      tags: ['Common phrases', 'Beginner'], 
      notes: 'Used when asking for something. Add the item before "주세요".',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 50, 
      phrase: '죄송합니다 (Joesonghamnida)', 
      translation: 'I\'m sorry', 
      learned: false, // Converted from proficiency 65
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      notes: 'Formal apology. "미안해" (Mianhae) is the casual version.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">Dashboard</h1>
        <GuardedLink href="/add-phrase">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Add Phrase
          </Button>
        </GuardedLink>
      </div>
      
      {/* Stats Card with Daily Streak, Best Time, and Latest Quiz Results */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Daily Streak */}
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-secondary">Daily Streak</h2>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.streakDays} days</p>
              </div>
            </div>
            
            {/* Best Time */}
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-secondary">Best Time</h2>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.bestTime}s</p>
              </div>
            </div>
            
            {/* Latest Quiz Results */}
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-2">Latest Quiz</h2>
              <div className="flex gap-2">
                {/* Correct */}
                <div className="flex items-center flex-1 bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-green-800 dark:text-green-300">Correct</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">{user.latestQuiz.correct}</p>
                  </div>
                </div>
                
                {/* Wrong */}
                <div className="flex items-center flex-1 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <X className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-rose-800 dark:text-rose-300">Wrong</p>
                    <p className="text-lg font-bold text-rose-700 dark:text-rose-400">{user.latestQuiz.wrong}</p>
                  </div>
                </div>
                
                {/* Timed Out */}
                <div className="flex items-center flex-1 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Timed Out</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{user.latestQuiz.timedOut}</p>
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
                  {recentPhrases.map((phrase) => (
                    <TableRow 
                      key={phrase.id} 
                      onClick={() => handlePhraseClick(phrase)}
                      className="cursor-pointer hover:bg-secondary/5 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="line-clamp-2 overflow-hidden break-words">{phrase.phrase}</div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2 overflow-hidden break-words">{phrase.translation}</div>
                      </TableCell>
                      <TableCell className="text-right sm:whitespace-nowrap">
                        {phrase.learned ? (
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
                  ))}
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
