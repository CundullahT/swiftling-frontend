import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Link } from "wouter";

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
  
  // Dummy user data for UI display
  const user = {
    streakDays: 7,
  };

  // Dummy data for progress metrics
  const progressStats = {
    daily: { total: 5, learned: 3 },
    weekly: { total: 18, learned: 12 },
    monthly: { total: 45, learned: 32 },
    total: { total: 120, learned: 85 }
  };

  // Dummy data for recent phrases
  const recentPhrases = [
    { id: 1, phrase: 'Gracias', translation: 'Thank you', learned: true },
    { id: 2, phrase: 'Buenos días', translation: 'Good morning', learned: true },
    { id: 3, phrase: 'Por favor', translation: 'Please', learned: true },
    { id: 4, phrase: '¿Cómo estás?', translation: 'How are you?', learned: false },
    { id: 5, phrase: 'Lo siento mucho por el malentendido. No fue mi intención causar problemas. Espero que podamos resolver esto pronto.', translation: 'I\'m very sorry for the misunderstanding. It was not my intention to cause problems. I hope we can resolve this soon.', learned: false },
    { id: 6, phrase: 'Hasta luego', translation: 'See you later', learned: true },
    { id: 7, phrase: '¿Dónde está el museo de arte moderno? Estoy buscando la exhibición especial que comenzó la semana pasada.', translation: 'Where is the modern art museum? I am looking for the special exhibition that started last week.', learned: false },
    { id: 8, phrase: 'Me gusta', translation: 'I like it', learned: true },
    { id: 9, phrase: 'No entiendo lo que estás tratando de explicar. ¿Podrías hablar más despacio y usar palabras más simples, por favor?', translation: 'I don\'t understand what you are trying to explain. Could you speak more slowly and use simpler words, please?', learned: false },
    { id: 10, phrase: 'Mucho gusto', translation: 'Nice to meet you', learned: true },
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">Dashboard</h1>
        <Link href="/add-phrase">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Add Phrase
          </Button>
        </Link>
      </div>
      
      {/* Daily Streak */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Star className="h-6 w-6 text-accent" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-secondary">Daily Streak</h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.streakDays} days</p>
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
            <div className="bg-secondary/5 rounded-lg p-4 shadow-sm border border-primary/10">
              <h3 className="text-sm font-medium text-secondary mb-2">Weekly Progress</h3>
              <div className="flex flex-col items-center">
                <PieChart 
                  data={[
                    { value: progressStats.weekly.learned, color: 'hsl(var(--secondary))' }, // Secondary for learned
                    { value: progressStats.weekly.total - progressStats.weekly.learned, color: 'hsl(var(--muted))' } // Muted for not learned
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
                    <p className="text-lg font-semibold text-secondary">{progressStats.weekly.learned}</p>
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
                    <TableRow key={phrase.id}>
                      <TableCell className="font-medium">
                        <div className="line-clamp-2 overflow-hidden break-words">{phrase.phrase}</div>
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2 overflow-hidden break-words">{phrase.translation}</div>
                      </TableCell>
                      <TableCell className="text-right sm:whitespace-nowrap">
                        {phrase.learned ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary whitespace-nowrap">
                            Learned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent/90 whitespace-nowrap">
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
    </div>
  );
}
