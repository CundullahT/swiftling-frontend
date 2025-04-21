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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { LanguageButton } from "@/components/ui/language-button";
import { Globe, BookOpen, HelpCircle, Volume2 } from "lucide-react";
import { 
  SAMPLE_TAGS, 
  QUIZ_TYPES, 
  QUIZ_DIFFICULTIES, 
  QUIZ_LENGTHS, 
  QUIZ_TIME_LIMITS 
} from "@/lib/constants";

export default function Quiz() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");

  // Placeholder quiz history data
  const quizHistory = [
    {
      id: 1,
      date: "Yesterday",
      type: "Multiple Choice",
      category: "Greetings",
      score: "90%",
      time: "2:15"
    },
    {
      id: 2,
      date: "3 days ago",
      type: "Translation",
      category: "Common phrases",
      score: "85%",
      time: "3:42"
    },
    {
      id: 3,
      date: "Last week",
      type: "Listening",
      category: "All categories",
      score: "75%",
      time: "5:10"
    }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-2xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">Quiz</h1>
      
      {/* Quiz Type Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Choose Quiz Type</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZ_TYPES.map((type) => (
              <LanguageButton
                key={type.id}
                name={type.name}
                description={type.description}
                icon={
                  <div className={`${type.color} h-10 w-10 rounded-full flex items-center justify-center`}>
                    {type.id === 'translation' ? (
                      <Globe className="h-6 w-6" />
                    ) : type.id === 'multiple-choice' ? (
                      <HelpCircle className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Settings */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quiz Settings</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="quiz-tag">Filter by Tag</Label>
              <Select defaultValue="all">
                <SelectTrigger id="quiz-tag">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {SAMPLE_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag.toLowerCase()}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="quiz-difficulty">Difficulty</Label>
              <Select defaultValue={QUIZ_DIFFICULTIES[0].id}>
                <SelectTrigger id="quiz-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {QUIZ_DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="quiz-length">Number of Questions</Label>
              <Select defaultValue={QUIZ_LENGTHS[1].id}>
                <SelectTrigger id="quiz-length">
                  <SelectValue placeholder="Select quiz length" />
                </SelectTrigger>
                <SelectContent>
                  {QUIZ_LENGTHS.map((length) => (
                    <SelectItem key={length.id} value={length.id}>
                      {length.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="quiz-time">Time Limit</Label>
              <Select defaultValue={QUIZ_TIME_LIMITS[0].id}>
                <SelectTrigger id="quiz-time">
                  <SelectValue placeholder="Select time limit" />
                </SelectTrigger>
                <SelectContent>
                  {QUIZ_TIME_LIMITS.map((time) => (
                    <SelectItem key={time.id} value={time.id}>
                      {time.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6">
            <Button>
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz History */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quiz History</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Quiz Type</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizHistory.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell>{quiz.date}</TableCell>
                    <TableCell className="font-medium">{quiz.type}</TableCell>
                    <TableCell>{quiz.category}</TableCell>
                    <TableCell>{quiz.score}</TableCell>
                    <TableCell>{quiz.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
