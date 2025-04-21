import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { LANGUAGES, PROFICIENCY_LEVELS } from "@/lib/constants";

export default function Settings() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Handle form submission - would connect to API in real implementation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save settings logic would go here
    alert("Settings saved!");
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Account Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                  id="first-name" 
                  name="first-name" 
                  defaultValue="Alex" 
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                  id="last-name" 
                  name="last-name" 
                  defaultValue="Johnson" 
                />
              </div>

              <div className="sm:col-span-6">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  defaultValue="alex@example.com" 
                />
              </div>

              <div className="sm:col-span-6">
                <div className="flex justify-between">
                  <Label htmlFor="current-password">Current password</Label>
                  <Button variant="link" className="h-auto p-0">
                    Forgot password?
                  </Button>
                </div>
                <Input 
                  id="current-password" 
                  name="current-password" 
                  type="password" 
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="new-password">New password</Label>
                <Input 
                  id="new-password" 
                  name="new-password" 
                  type="password" 
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input 
                  id="confirm-password" 
                  name="confirm-password" 
                  type="password" 
                />
              </div>
            </div>
          </CardContent>
          
          <Separator />
          
          <CardContent className="pt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Language Learning Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="learning-language">Learning Language</Label>
                <Select defaultValue="spanish">
                  <SelectTrigger id="learning-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.id} value={language.id}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="proficiency-level">Proficiency Level</Label>
                <Select defaultValue="intermediate">
                  <SelectTrigger id="proficiency-level">
                    <SelectValue placeholder="Select proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-6">
                <Label htmlFor="daily-goal">Daily Goal (minutes)</Label>
                <Select defaultValue="15">
                  <SelectTrigger id="daily-goal">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          
          <Separator />
          
          <CardContent className="pt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <Checkbox 
                  id="email-notifications" 
                  defaultChecked 
                />
                <div className="ml-3">
                  <Label 
                    htmlFor="email-notifications" 
                    className="font-medium text-gray-700"
                  >
                    Email notifications
                  </Label>
                  <p className="text-gray-500 text-sm">
                    Get notified about your progress and achievements via email.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Checkbox 
                  id="daily-reminder" 
                  defaultChecked 
                />
                <div className="ml-3">
                  <Label 
                    htmlFor="daily-reminder" 
                    className="font-medium text-gray-700"
                  >
                    Daily reminder
                  </Label>
                  <p className="text-gray-500 text-sm">
                    Receive a daily reminder to practice.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Checkbox 
                  id="learning-tips" 
                  defaultChecked 
                />
                <div className="ml-3">
                  <Label 
                    htmlFor="learning-tips" 
                    className="font-medium text-gray-700"
                  >
                    Learning tips
                  </Label>
                  <p className="text-gray-500 text-sm">
                    Receive weekly language learning tips and resources.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <Button type="button" variant="outline" className="mr-3">
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </Card>
      </form>
      
      <div className="mt-10">
        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg leading-6 font-medium text-red-600">Delete account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Once you delete your account, all of your data will be permanently removed. 
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-5">
              <Button variant="destructive">
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
