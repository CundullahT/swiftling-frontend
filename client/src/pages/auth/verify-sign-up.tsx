import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getQuizServiceURL } from "@shared/config";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type VerificationState = "loading" | "success" | "error" | "timeout" | "invalid-token";

export default function SignUpVerification() {
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // UUID validation regex
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Account verification function
  const verifyAccount = async (verificationToken: string) => {
    try {
      const verifyUrl = await getQuizServiceURL(`/account/enable?token=${verificationToken}`);
      
      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      console.log('Verification response status:', response.status);

      if (response.status === 200) {
        const responseData = await response.json();
        console.log('Verification response data:', responseData);
        
        if (responseData.success) {
          setVerificationState("success");
          setSuccessDialogOpen(true);
          return;
        }
      }
      
      // Handle error response - only show toast, don't throw
      const errorData = await response.json().catch(() => ({ message: 'Account verification failed. Please try again.' }));
      toast({
        title: "Verification Failed",
        description: errorData.message || "Account verification failed. Please try again.",
        variant: "destructive",
      });
      
      setVerificationState("error");
    } catch (error) {
      console.error('Verification request error:', error);
      // Only show toast once
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
      setVerificationState("error");
    }
  };

  // Check for token and verify account on page load
  useEffect(() => {
    // Parse URL to get token parameter
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (!tokenParam) {
      setVerificationState("invalid-token");
      return;
    }

    // Validate UUID format
    if (!isValidUUID(tokenParam)) {
      setVerificationState("invalid-token");
      return;
    }

    setToken(tokenParam);
    
    // Set up timeout after 20 seconds
    const timeoutTimer = setTimeout(() => {
      setVerificationState("timeout");
    }, 20000);
    
    setTimeoutId(timeoutTimer);
    
    // Start verification process 
    const handleVerification = async () => {
      try {
        await verifyAccount(tokenParam);
      } catch (error) {
        console.error('Verification error caught:', error);
        setVerificationState("error");
      }
    };
    
    handleVerification();
    
    // Cleanup function
    return () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    };
  }, []);
  
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

      case "invalid-token":
        return (
          <>
            <div className="mb-6 text-amber-500">
              <AlertCircle size={64} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Invalid or Missing Token
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              The verification link appears to be invalid or missing the required token. Please make sure you're using the complete verification URL from your email.
            </p>
            
            <Button asChild className="w-full">
              <Link href="/signup">
                Back to Sign Up
              </Link>
            </Button>
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
      
      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Verified Successfully</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <span>Your account has been successfully verified! You can now log in and start using all features of SwiftLing.</span>
              
              <span className="block text-sm">Welcome to your language learning journey!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center">
            <AlertDialogAction asChild>
              <Button onClick={() => setLocation('/login')}>
                Proceed to Login
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}