import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressRing } from "@/components/ui/progress-ring";
import { LanguageButton } from "@/components/ui/language-button";
import { 
  BookOpen, 
  Volume2, 
  HelpCircle, 
  CheckCircle, 
  Mic,
  BarChart
} from "lucide-react";

export default function Dashboard() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Dummy user data for UI display
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    progress: 65,
    streakDays: 7,
    language: "Spanish",
    proficiencyLevel: "Intermediate",
  };

  const recentActivity = [
    { 
      id: 1, 
      action: "Completed Daily Lesson", 
      description: "Earned 25 XP", 
      date: "Today", 
      icon: <CheckCircle className="h-6 w-6 text-primary" />
    },
    { 
      id: 2, 
      action: "Practiced Pronunciation", 
      description: "15 minutes", 
      date: "Yesterday", 
      icon: <Mic className="h-6 w-6 text-secondary" />
    },
    { 
      id: 3, 
      action: "Added 3 New Phrases", 
      description: "Travel category", 
      date: "2 days ago", 
      icon: <BookOpen className="h-6 w-6 text-accent" />
    },
  ];

  const recommendedPractice = [
    {
      id: 1,
      name: "Daily Vocabulary",
      description: "Learn 5 new words",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-accent"
    },
    {
      id: 2,
      name: "Pronunciation Practice",
      description: "Improve your accent",
      icon: <Volume2 className="h-6 w-6" />,
      color: "bg-secondary"
    },
    {
      id: 3,
      name: "Quiz Challenge",
      description: "Test your knowledge",
      icon: <HelpCircle className="h-6 w-6" />,
      color: "bg-primary"
    }
  ];

  const weeklyActivity = [
    { day: "Mon", value: 25 },
    { day: "Tue", value: 50 },
    { day: "Wed", value: 65 },
    { day: "Thu", value: 40 },
    { day: "Fri", value: 85 },
    { day: "Sat", value: 60 },
    { day: "Sun", value: 30 }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-gray-900">Your Progress</h3>
            <div className="mt-5 flex items-center">
              <ProgressRing percentage={user.progress} size={96}>
                <span className="text-2xl font-medium text-primary">{user.progress}%</span>
              </ProgressRing>
              
              <div className="ml-5">
                <h4 className="text-xl font-semibold text-gray-900">
                  {user.language} - {user.proficiencyLevel}
                </h4>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{user.streakDays} day streak</span>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Daily goal progress</span>
                <span className="text-sm font-medium text-gray-700">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4">
            <Button variant="link" className="px-0">View detailed statistics</Button>
          </CardFooter>
        </Card>

        {/* Study Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-gray-900">Study Summary</h3>
            <div className="mt-5 grid grid-cols-3 gap-5">
              <div className="bg-primary-50 rounded-lg shadow-sm p-4 text-center">
                <dt className="text-sm font-medium text-gray-500 truncate">Words Learned</dt>
                <dd className="mt-1 text-3xl font-semibold text-primary">45</dd>
              </div>
              <div className="bg-primary-50 rounded-lg shadow-sm p-4 text-center">
                <dt className="text-sm font-medium text-gray-500 truncate">Phrases</dt>
                <dd className="mt-1 text-3xl font-semibold text-primary">12</dd>
              </div>
              <div className="bg-primary-50 rounded-lg shadow-sm p-4 text-center">
                <dt className="text-sm font-medium text-gray-500 truncate">Quiz Score</dt>
                <dd className="mt-1 text-3xl font-semibold text-primary">85%</dd>
              </div>
            </div>
            <div className="mt-5">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Weekly Activity</h4>
              <div className="flex justify-between items-end h-24">
                {weeklyActivity.map((day, index) => (
                  <div 
                    key={index} 
                    className={`w-8 rounded-t-lg`}
                    style={{ 
                      height: `${day.value}%`, 
                      backgroundColor: `hsl(var(--primary) / ${0.3 + (day.value / 100) * 0.7})` 
                    }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                {weeklyActivity.map((day, index) => (
                  <div key={index}>{day.day}</div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4">
            <Button>Practice today</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recommended Practice */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Practice</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedPractice.map((practice) => (
            <LanguageButton
              key={practice.id}
              name={practice.name}
              description={practice.description}
              icon={<div className={`${practice.color} h-10 w-10 rounded-full flex items-center justify-center`}>
                {practice.icon}
              </div>}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-500">{activity.description}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
