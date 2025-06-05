import { useState } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuardedLink } from "@/components/ui/guarded-link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Check, X, AlertCircle, Trophy, Timer, ChevronLeft, ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function QuizHistory() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Scroll to top on page load
  useScrollTop();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Quiz history data - empty array to show empty state
  const quizHistory: any[] = [];
  
  // Sample data for testing (uncomment to test with data)
  /*
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
    {
      id: 6,
      date: new Date(2025, 3, 24), // April 24, 2025
      type: "Multiple Choice",
      language: "French",
      correct: 17,
      wrong: 3,
      timedOut: 0,
      bestTime: 2.7,
      worstTime: 6.9,
      averageTime: 4.3
    },
    {
      id: 7,
      date: new Date(2025, 3, 23), // April 23, 2025
      type: "Spelling",
      language: "Japanese",
      correct: 10,
      wrong: 8,
      timedOut: 2,
      bestTime: 4.5,
      worstTime: 9.8,
      averageTime: 6.7
    },
    {
      id: 8,
      date: new Date(2025, 3, 22), // April 22, 2025
      type: "Flash Cards",
      language: "German",
      correct: 22,
      wrong: 3,
      timedOut: 0,
      bestTime: 2.1,
      worstTime: 5.6,
      averageTime: 3.7
    },
    {
      id: 9,
      date: new Date(2025, 3, 21), // April 21, 2025
      type: "Multiple Choice",
      language: "All Languages",
      correct: 30,
      wrong: 10,
      timedOut: 5,
      bestTime: 3.0,
      worstTime: 8.5,
      averageTime: 5.9
    },
    {
      id: 10,
      date: new Date(2025, 3, 20), // April 20, 2025
      type: "Spelling",
      language: "French",
      correct: 19,
      wrong: 6,
      timedOut: 0,
      bestTime: 2.9,
      worstTime: 7.3,
      averageTime: 4.8
    },
    {
      id: 11,
      date: new Date(2025, 3, 19), // April 19, 2025
      type: "Multiple Choice",
      language: "Italian",
      correct: 16,
      wrong: 9,
      timedOut: 5,
      bestTime: 3.1,
      worstTime: 8.5,
      averageTime: 5.9
    },
    {
      id: 12,
      date: new Date(2025, 3, 18), // April 18, 2025
      type: "Flash Cards",
      language: "Spanish",
      correct: 27,
      wrong: 3,
      timedOut: 0,
      bestTime: 2.5,
      worstTime: 6.0,
      averageTime: 4.2
    },
    {
      id: 13,
      date: new Date(2025, 3, 17), // April 17, 2025
      type: "Spelling",
      language: "Korean",
      correct: 14,
      wrong: 11,
      timedOut: 5,
      bestTime: 3.7,
      worstTime: 9.1,
      averageTime: 6.5
    },
    {
      id: 14,
      date: new Date(2025, 3, 16), // April 16, 2025
      type: "Multiple Choice",
      language: "Russian",
      correct: 20,
      wrong: 0,
      timedOut: 0,
      bestTime: 2.3,
      worstTime: 5.7,
      averageTime: 3.9
    },
    {
      id: 15,
      date: new Date(2025, 3, 15), // April 15, 2025
      type: "Flash Cards",
      language: "Japanese",
      correct: 18,
      wrong: 7,
      timedOut: 5,
      bestTime: 3.4,
      worstTime: 8.9,
      averageTime: 6.2
    },
    {
      id: 16,
      date: new Date(2025, 3, 14), // April 14, 2025
      type: "Spelling",
      language: "All Languages",
      correct: 25,
      wrong: 15,
      timedOut: 10,
      bestTime: 3.9,
      worstTime: 10.2,
      averageTime: 7.3
    },
    {
      id: 17,
      date: new Date(2025, 3, 13), // April 13, 2025
      type: "Multiple Choice",
      language: "German",
      correct: 22,
      wrong: 8,
      timedOut: 0,
      bestTime: 2.6,
      worstTime: 7.1,
      averageTime: 4.7
    },
    {
      id: 18,
      date: new Date(2025, 3, 12), // April 12, 2025
      type: "Flash Cards",
      language: "French",
      correct: 20,
      wrong: 5,
      timedOut: 0,
      bestTime: 2.2,
      worstTime: 6.3,
      averageTime: 4.1
    },
    {
      id: 19,
      date: new Date(2025, 3, 11), // April 11, 2025
      type: "Spelling",
      language: "Spanish",
      correct: 17,
      wrong: 3,
      timedOut: 0,
      bestTime: 2.4,
      worstTime: 6.0,
      averageTime: 4.0
    },
    {
      id: 20,
      date: new Date(2025, 3, 10), // April 10, 2025
      type: "Multiple Choice",
      language: "Italian",
      correct: 19,
      wrong: 6,
      timedOut: 5,
      bestTime: 3.2,
      worstTime: 8.6,
      averageTime: 5.8
    },
    {
      id: 21,
      date: new Date(2025, 3, 9), // April 9, 2025
      type: "Flash Cards",
      language: "All Languages",
      correct: 32,
      wrong: 8,
      timedOut: 0,
      bestTime: 2.0,
      worstTime: 5.5,
      averageTime: 3.6
    },
    {
      id: 22,
      date: new Date(2025, 3, 8), // April 8, 2025
      type: "Spelling",
      language: "Korean",
      correct: 13,
      wrong: 7,
      timedOut: 0,
      bestTime: 3.0,
      worstTime: 7.8,
      averageTime: 5.2
    },
    {
      id: 23,
      date: new Date(2025, 3, 7), // April 7, 2025
      type: "Multiple Choice",
      language: "Japanese",
      correct: 16,
      wrong: 4,
      timedOut: 0,
      bestTime: 2.5,
      worstTime: 6.7,
      averageTime: 4.3
    },
    {
      id: 24,
      date: new Date(2025, 3, 6), // April 6, 2025
      type: "Flash Cards",
      language: "Russian",
      correct: 21,
      wrong: 9,
      timedOut: 0,
      bestTime: 2.8,
      worstTime: 7.9,
      averageTime: 5.3
    },
    {
      id: 25,
      date: new Date(2025, 3, 5), // April 5, 2025
      type: "Spelling",
      language: "German",
      correct: 18,
      wrong: 2,
      timedOut: 0,
      bestTime: 2.1,
      worstTime: 5.9,
      averageTime: 3.9
    }
    */

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
      
      {/* Show empty state when no quiz history */}
      {quizHistory.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">No Quiz History Yet</h3>
              <p className="text-secondary/70 mb-6 max-w-md">
                You haven't solved any quizzes yet. Start your language learning journey by taking your first quiz!
              </p>
              <GuardedLink href="/quiz">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Start Your First Quiz
                </Button>
              </GuardedLink>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                    {quizHistory
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((quiz) => (
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
              
              {/* Pagination */}
              {quizHistory.length > itemsPerPage && (
                <div className="w-full p-4 flex justify-center items-center border-t border-primary/10 bg-primary/5">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* First/Previous row on small screens */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center min-w-0"
                      >
                        <ChevronLeft className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({length: Math.min(3, Math.ceil(quizHistory.length / itemsPerPage))}, (_, i) => {
                          const pageNum = currentPage === 1 ? i + 1 : 
                                        currentPage === Math.ceil(quizHistory.length / itemsPerPage) ? 
                                        Math.max(1, Math.ceil(quizHistory.length / itemsPerPage) - 2) + i :
                                        currentPage - 1 + i;
                          
                          if (pageNum <= Math.ceil(quizHistory.length / itemsPerPage)) {
                            return (
                              <Button
                                key={i}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-9 h-9 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === Math.ceil(quizHistory.length / itemsPerPage)}
                        className="flex items-center min-w-0"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4 sm:ml-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.ceil(quizHistory.length / itemsPerPage))}
                        disabled={currentPage === Math.ceil(quizHistory.length / itemsPerPage)}
                        className="hidden sm:flex"
                      >
                        Last
                      </Button>
                    </div>
                    
                    {/* Page indicator for small screens */}
                    <div className="text-sm text-gray-500 w-full text-center sm:hidden mt-2">
                      Page {currentPage} of {Math.ceil(quizHistory.length / itemsPerPage)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}