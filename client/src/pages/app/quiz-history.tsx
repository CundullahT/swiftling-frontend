import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuardedLink } from "@/components/ui/guarded-link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Check, X, AlertCircle, Trophy, Timer, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function QuizHistory() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Scroll to top on page load
  useScrollTop();
  
  // Sample quiz history data
  const quizHistory = [
    {
      id: 1,
      date: new Date(2025, 4, 2), // May 2, 2025
      type: "Multiple Choice",
      language: "Russian",
      correct: 12,
      wrong: 5,
      timedOut: 3,
      bestTime: 3.8,
      worstTime: 8.2,
      averageTime: 5.4
    },
    {
      id: 2,
      date: new Date(2025, 4, 1), // May 1, 2025
      type: "Spelling",
      language: "Korean",
      correct: 15,
      wrong: 3,
      timedOut: 2,
      bestTime: 4.2,
      worstTime: 9.5,
      averageTime: 6.1
    },
    {
      id: 3,
      date: new Date(2025, 3, 30), // April 30, 2025
      type: "Flash Cards",
      language: "All Languages",
      correct: 25,
      wrong: 8,
      timedOut: 7,
      bestTime: 2.9,
      worstTime: 7.8,
      averageTime: 4.9
    },
    {
      id: 4,
      date: new Date(2025, 3, 28), // April 28, 2025
      type: "Multiple Choice",
      language: "Korean",
      correct: 18,
      wrong: 7,
      timedOut: 5,
      bestTime: 3.5,
      worstTime: 8.7,
      averageTime: 5.8
    },
    {
      id: 5,
      date: new Date(2025, 3, 25), // April 25, 2025
      type: "Spelling",
      language: "Russian",
      correct: 20,
      wrong: 5,
      timedOut: 5,
      bestTime: 3.3,
      worstTime: 8.1,
      averageTime: 5.2
    },
  ];

  // Calculate success rate percentage
  const getSuccessRate = (correct: number, wrong: number, timedOut: number) => {
    const total = correct + wrong + timedOut;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <GuardedLink href="/quiz">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </GuardedLink>
          <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">Quiz History</h1>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="overflow-hidden">
            <div className="overflow-x-auto relative w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-primary/10">
                    <TableHead className="text-secondary">Date</TableHead>
                    <TableHead className="text-center text-secondary">Quiz Type</TableHead>
                    <TableHead className="text-center text-secondary">Language</TableHead>
                    <TableHead className="text-center text-secondary">Score</TableHead>
                    <TableHead className="text-secondary">
                      <div className="flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600 mr-1" />
                        <span>Correct</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-secondary">
                      <div className="flex items-center justify-center">
                        <X className="h-4 w-4 text-rose-600 mr-1" />
                        <span>Wrong</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-secondary">
                      <div className="flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
                        <span>Timed Out</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-secondary">
                      <div className="flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-primary mr-1" />
                        <span>Best Time</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-secondary">
                      <div className="flex items-center justify-center">
                        <Timer className="h-4 w-4 text-rose-600 mr-1" />
                        <span>Worst Time</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizHistory.map((quiz) => (
                    <TableRow key={quiz.id} className="hover:bg-secondary/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-secondary/70 mr-2" />
                          <span>{format(quiz.date, "MMM d, yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{quiz.type}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2">
                            {quiz.language}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-secondary/10">
                          <span className="font-bold text-sm">{getSuccessRate(quiz.correct, quiz.wrong, quiz.timedOut)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-600">{quiz.correct}</TableCell>
                      <TableCell className="text-center font-medium text-rose-600">{quiz.wrong}</TableCell>
                      <TableCell className="text-center font-medium text-amber-600">{quiz.timedOut}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary mr-1" />
                          <span className="font-medium text-primary">{quiz.bestTime}s</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 text-rose-600 mr-1" />
                          <span className="font-medium text-rose-600">{quiz.worstTime}s</span>
                        </div>
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