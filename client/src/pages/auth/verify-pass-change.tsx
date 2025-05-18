import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

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
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Create form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check for token in URL on page load
  useEffect(() => {
    // Parse URL to get token parameter
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (!tokenParam) {
      setVerificationState("invalid-token");
    } else {
      setToken(tokenParam);
      setVerificationState("form");
    }
  }, []);

  // Submit handler for password form
  const onSubmit = (data: PasswordFormValues) => {
    setVerificationState("loading");
    
    // Simulate API call with token and new password
    // In actual implementation, you would make an API call here to the backend
    console.log(`Submitting new password with token: ${token}`);
    console.log(`New password: ${data.password}`);
    
    // Simulate timeout after 10 seconds (for demonstration only)
    // In real implementation, this would be a timeout on API call or response handler
    const timeoutTimer = setTimeout(() => {
      if (verificationState === "loading") {
        setVerificationState("timeout");
      }
    }, 10000);
    
    return () => clearTimeout(timeoutTimer);
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
              The verification link appears to be invalid or expired. Please request a new password reset link.
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
                        <PasswordInput {...field} />
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
                
                <Button type="submit" className="w-full">
                  Set New Password
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
            
            <Button asChild className="w-full">
              <Link href="/login">
                Back to Login
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
    </div>
  );
}