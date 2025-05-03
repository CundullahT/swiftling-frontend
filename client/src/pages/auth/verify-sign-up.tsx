import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

type VerificationState = "loading" | "success" | "error" | "timeout";

export default function SignUpVerification() {
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  
  // Simulate a timeout after 10 seconds
  useEffect(() => {
    // This timer simulates a timeout after 10 seconds
    const timeoutTimer = setTimeout(() => {
      if (verificationState === "loading") {
        setVerificationState("timeout");
      }
    }, 10000);
    
    // Clean up the timer when the component unmounts
    return () => clearTimeout(timeoutTimer);
  }, [verificationState]);
  
  // Content to display based on the verification state
  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <>
            <div className="mb-6 text-primary animate-spin">
              <Loader2 size={64} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Verifying Your Account
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              Please wait while we verify your account. This should only take a moment.
            </p>
          </>
        );
        
      case "success":
        return (
          <>
            <div className="mb-6 text-primary">
              <CheckCircle2 size={64} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Account Verified Successfully
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              Your account has been successfully verified. You can now log in and start using all features of SwiftLing.
            </p>
            
            <Button asChild className="w-full">
              <Link href="/login">
                Proceed to Login
              </Link>
            </Button>
          </>
        );
        
      case "error":
      case "timeout":
        return (
          <>
            <div className="mb-6 text-rose-500">
              <XCircle size={64} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {verificationState === "timeout" ? "Verification Timed Out" : "Verification Failed"}
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              {verificationState === "timeout" 
                ? "We were unable to verify your account in time. This may be due to network issues or high server traffic."
                : "We encountered an error while verifying your account. The link may have expired or is invalid."}
            </p>
            
            <div className="space-y-3 w-full">
              {verificationState === "timeout" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              )}
              
              <Button asChild className="w-full">
                <Link href="/login">
                  Back to Login
                </Link>
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Account Verification
          </h2>
        </div>
        
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            {renderContent()}
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Welcome to <span className="font-semibold text-primary">SwiftLing</span> - Your language learning journey begins here!
          </p>
        </div>
      </div>
    </div>
  );
}