import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

export default function Signup() {
  const [, setLocation] = useLocation();

  // Redirect to dashboard when Create account button is clicked
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create your SwiftLing account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your language learning journey today
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSignup}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="first-name">First name</Label>
                  <Input 
                    id="first-name" 
                    name="first-name" 
                    type="text" 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="last-name">Last name</Label>
                  <Input 
                    id="last-name" 
                    name="last-name" 
                    type="text" 
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input 
                  id="confirm-password" 
                  name="confirm-password" 
                  type="password" 
                  required 
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:text-primary/80">Terms</Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:text-primary/80">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
