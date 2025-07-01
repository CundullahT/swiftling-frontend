import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { getQuizServiceURL } from "@shared/config";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type VerificationState = "loading" | "success" | "error" | "timeout" | "form" | "invalid-token";

// Password validation schema
const passwordSchema = z.object({
  password: z.string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (#?!@$%^&*-)"
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordChangeVerification() {
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // UUID validation regex
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // Create form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Show errors while typing
  });

  // Password reset function
  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      const resetUrl = await getQuizServiceURL(`/account/reset-pass?token=${resetToken}`);
      
      const response = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          newPassword: newPassword
        })
      });

      if (response.status === 200) {
        const responseData = await response.json();
        
        if (responseData.success) {
          setVerificationState("success");
          setSuccessDialogOpen(true);
          return;
        }
      }
      
      // Handle error response
      setVerificationState("error");
    } catch (error) {
      // Network error
      setVerificationState("error");
    }
  };

  // Check for token and validate on page load
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
    setVerificationState("form");
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Submit handler for password form
  const onSubmit = async (data: PasswordFormValues) => {
    if (!token) return;
    
    setIsSubmitting(true);
    setVerificationState("loading");
    
    // Set up timeout after 20 seconds
    const timeoutTimer = setTimeout(() => {
      setVerificationState("timeout");
      setIsSubmitting(false);
    }, 20000);
    
    setTimeoutId(timeoutTimer);
    
    // Start password reset process
    const handlePasswordReset = async () => {
      try {
        await resetPassword(token, data.password);
      } catch (error) {
        console.error('Password reset error caught:', error);
        setVerificationState("error");
      } finally {
        setIsSubmitting(false);
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
        }
      }
    };
    
    handlePasswordReset();
  };
  
  // Content to display based on the verification state
  const renderContent = () => {
    switch (verificationState) {
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
              The password reset link appears to be invalid or missing the required token. Please make sure you're using the complete reset URL from your email.
            </p>
            
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">
                Request New Link
              </Link>
            </Button>
          </>
        );
        
      case "form":
        return (
          <>
            <div className="mb-6 text-primary">
              <CheckCircle2 size={48} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Create New Password
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              Please enter your new password below.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            // Trigger validation for confirmPassword when password changes
                            form.trigger("confirmPassword");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!form.formState.isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting Password...
                    </>
                  ) : (
                    "Set New Password"
                  )}
                </Button>
              </form>
            </Form>
          </>
        );
        
      case "loading":
        return (
          <>
            <div className="mb-6 text-primary animate-spin">
              <Loader2 size={64} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing Your Request
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              Please wait while we update your password. This should only take a moment.
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
              Password Changed Successfully
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              Your password has been successfully changed. You can now log in with your new password.
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
              {verificationState === "timeout" ? "Request Timed Out" : "Password Change Failed"}
            </h3>
            
            <p className="text-center text-base text-gray-700 mb-6">
              {verificationState === "timeout" 
                ? "We were unable to update your password at this time. This may be due to network issues or high server traffic."
                : "We encountered an error while updating your password. The link may have expired or is invalid."}
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
                <Link href="/auth/forgot-password">
                  Request New Link
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
            Password Reset
          </h2>
        </div>
        
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            {renderContent()}
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Thank you for using <span className="font-semibold text-primary">SwiftLing</span>
          </p>
        </div>
      </div>
      
      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset Successfully</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <span>Your password has been successfully changed! You can now log in with your new password.</span>
              
              <span className="block text-sm">Welcome back to your language learning journey!</span>
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