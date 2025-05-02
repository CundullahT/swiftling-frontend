import { useState } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GuardedLink } from "@/components/ui/guarded-link";
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Validation schema for account form
const accountFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Validation schema for password form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must include at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must include at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must include at least one special character." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types for our form data
type AccountFormValues = z.infer<typeof accountFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Toast notifications
  const { toast } = useToast();
  
  // State for delete account confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Account form setup
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex@example.com",
    },
  });
  
  // Password form setup
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle account form submission - validation only, no actual functionality
  const onAccountSubmit = (data: AccountFormValues) => {
    // Form is valid if we get here
    toast({
      title: "Account Settings",
      description: "Account information validated successfully. (Functionality disabled)",
    });
  };
  
  // Handle password form submission - validation only, no actual functionality
  const onPasswordSubmit = (data: PasswordFormValues) => {
    // Form is valid if we get here
    toast({
      title: "Password Updated",
      description: "Password validated successfully. (Functionality disabled)",
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent mb-6">Settings</h1>
      
      {/* Account Settings */}
      <Form {...accountForm}>
        <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Account Settings</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <FormField
                    control={accountForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormField
                    control={accountForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-6">
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-3"
                onClick={() => accountForm.reset()}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      </Form>
      
      {/* Password Settings */}
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Password Settings</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <div className="flex justify-between">
                          <FormLabel>Current password</FormLabel>
                          <GuardedLink href="/auth/forgot-password">
                            <Button variant="link" className="h-auto p-0" title="Future feature: Will auto-fill email for logged-in users">
                              Forgot password?
                            </Button>
                          </GuardedLink>
                        </div>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-3"
                onClick={() => passwordForm.reset()}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      </Form>
      
      {/* Danger Zone */}
      <div className="mt-10">
        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg leading-6 font-medium text-red-600">Delete Account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Once you delete your account, all of your data will be permanently removed. 
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-5">
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data, including phrases, quiz history, and settings will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              className="sm:flex-1"
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              className="sm:flex-1 bg-rose-600 hover:bg-rose-600/90 text-white"
              variant="destructive"
            >
              Delete My Account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}