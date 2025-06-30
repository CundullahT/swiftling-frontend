import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getQuizServiceURL } from "@shared/config";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Validation schema for signup form
const signupSchema = z.object({
  firstName: z.string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(24, { message: "First name must be less than 24 characters" }),
  lastName: z.string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(24, { message: "Last name must be less than 24 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (#?!@$%^&*-)"
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Form setup with validation
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  });
  
  // Handle form submission
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Get the quiz service URL for the current environment
      const signupUrl = await getQuizServiceURL('/account/signup');
      
      // Prepare the request payload (excluding confirmPassword as it's not needed by backend)
      const requestPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      };
      
      // Make the API call
      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      
      const responseData = await response.json();
      
      // Check if the request was successful
      if (response.status === 201 || responseData.success) {
        // Show success dialog
        setSuccessDialogOpen(true);
      } else {
        // Handle error response
        const errorMessage = responseData.message || 'Sign up failed. Please try again.';
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join SwiftLing to start your language learning journey
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your first name" 
                            autoComplete="given-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your last name" 
                            autoComplete="family-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Enter your email address" 
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput 
                          {...field} 
                          placeholder="Create a password" 
                          autoComplete="new-password"
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
                        <PasswordInput 
                          {...field} 
                          placeholder="Confirm your password" 
                          autoComplete="new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={!form.formState.isValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our <Link href="/legal/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/legal/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
      
      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verification Email Sent</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <span>We've sent a verification email to your inbox. Please check your email and follow the instructions to verify your account before logging in.</span>
              
              <span className="block text-sm">If you don't see the email in your inbox, please check your spam or junk folder.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center">
            <AlertDialogAction asChild>
              <Button>
                <Link href="/login">
                  Proceed to Login
                </Link>
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}