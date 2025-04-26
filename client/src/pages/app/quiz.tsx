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
import { LanguageButton } from "@/components/ui/language-button";
import { Sparkles, BookOpen, Brain, Lightbulb } from "lucide-react";
import { 
  QUIZ_TYPES, 
  ADAPTIVE_TIME_PRESETS
} from "@/lib/constants";

export default function Quiz() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent mb-6">Quiz</h1>
      
      {/* Quiz Type Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Choose Quiz Type</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {QUIZ_TYPES.map((type) => (
              <div key={type.id} className="relative overflow-hidden hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 shadow-sm">
                <div className="p-4 flex items-start gap-3">
                  <div className={`${type.color} h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center`}>
                    {type.id === 'learned' ? (
                      <Sparkles className="h-6 w-6 text-green-600" />
                    ) : type.id === 'not-learned' ? (
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    ) : (
                      <Brain className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h4 className="font-medium text-sm sm:text-base text-secondary truncate">{type.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{type.description}</p>
                  </div>
                </div>
                <div className="absolute inset-0 w-full h-full cursor-pointer" onClick={() => {}} aria-hidden="true" />
              </div>
            ))}
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
              <Select defaultValue="10">
                <SelectTrigger id="min-time">
                  <SelectValue placeholder="Select minimum time" />
                </SelectTrigger>
                <SelectContent>
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['5', '10'].includes(t.id)).map((time) => (
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
                  {ADAPTIVE_TIME_PRESETS.filter(t => ['30', '45', '60'].includes(t.id)).map((time) => (
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
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Start Quiz
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 italic">Quiz continues until you choose to finish</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
