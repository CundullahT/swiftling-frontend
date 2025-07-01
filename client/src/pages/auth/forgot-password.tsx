import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";
import { getQuizServiceURL } from "@shared/config";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Validation schema for the forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Setup form with validation
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Forgot password function
  const sendResetEmail = async (email: string) => {
    try {
      const forgotPasswordUrl = await getQuizServiceURL(`/account/forgot-pass?email=${encodeURIComponent(email)}`);
      
      const response = await fetch(forgotPasswordUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.status === 200) {
        const responseData = await response.json();
        
        if (responseData.success) {
          setUserEmail(email);
          setSuccessDialogOpen(true);
          return;
        }
      }
      
      // Handle error response
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Failed to send reset email. Please try again.';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } catch (error) {
      // Network error
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  };

  // Submit handler for forgot password
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    
    // Set up timeout after 20 seconds
    const timeoutTimer = setTimeout(() => {
      toast({
        title: "Request Timeout",
        description: "The request is taking longer than expected. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }, 20000);
    
    setTimeoutId(timeoutTimer);
    
    // Start forgot password process
    const handleForgotPassword = async () => {
      try {
        await sendResetEmail(data.email);
      } catch (error) {
        console.error('Forgot password error caught:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
        }
      }
    };
    
    handleForgotPassword();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text"
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  Back to sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Link Sent Successfully</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <span>A password reset link has been sent to <strong>{userEmail}</strong>.</span>
              
              <span className="block text-sm">Please check both your inbox and spam folders for the email, then follow the instructions to reset your password.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center">
            <AlertDialogAction asChild>
              <Button onClick={() => setLocation('/login')}>
                Back to Login
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}