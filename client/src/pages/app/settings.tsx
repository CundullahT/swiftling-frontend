import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function Settings() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Handle account form submission - would connect to API in real implementation
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save account settings logic would go here
    alert("Account settings saved!");
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save password settings logic would go here
    alert("Password updated successfully!");
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-2xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">Settings</h1>
      
      {/* Account Settings */}
      <form onSubmit={handleAccountSubmit} className="mb-6">
        <Card>
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
      
      {/* Password Settings */}
      <form onSubmit={handlePasswordSubmit} className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Password Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <div className="flex justify-between">
                  <Label htmlFor="current-password">Current password</Label>
                  <Link href="/auth/forgot-password">
                    <Button variant="link" className="h-auto p-0" title="Future feature: Will auto-fill email for logged-in users">
                      Forgot password?
                    </Button>
                  </Link>
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
      
      {/* Danger Zone */}
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
