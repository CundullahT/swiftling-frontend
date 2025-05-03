import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function PasswordChangeVerification() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Password Changed Successfully
          </h2>
        </div>
        
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="mb-6 text-primary">
              <CheckCircle2 size={64} />
            </div>
            
            <p className="text-center text-base text-gray-700 mb-6">
              Your password has been successfully changed. You can now log in with your new password.
            </p>
            
            <Button asChild className="w-full">
              <Link href="/login">
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Thank you for using <span className="font-semibold text-primary">SwiftLing</span>
          </p>
        </div>
      </div>
    </div>
  );
}