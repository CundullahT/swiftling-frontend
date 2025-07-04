import { useState, useEffect } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GuardedLink } from "@/components/ui/guarded-link";
import { Eye, EyeOff } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
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
import { useAuth } from "@/context/auth-context";
import { getQuizServiceURL } from "@shared/config";

// Function to decode JWT token and extract user information
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Validation schema for account form
const accountFormSchema = z.object({
  firstName: z.string()
    .min(0, { message: "First name is optional" })
    .max(24, { message: "First name must be less than 24 characters" }),
  lastName: z.string()
    .min(0, { message: "Last name is optional" })
    .max(24, { message: "Last name must be less than 24 characters" }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

// Validation schema for password form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (#?!@$%^&*-)"
    }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types for our form data
type AccountFormValues = z.infer<typeof accountFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  // Auth context
  const { isAuthenticated, tokens } = useAuth();
  useAuthRedirect(!isAuthenticated, "/login");
  
  // Toast notifications
  const { toast } = useToast();
  
  // State for delete account confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountFormChanged, setAccountFormChanged] = useState(false);
  
  // Default account values - extracted from JWT token
  const [defaultAccountValues, setDefaultAccountValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Account form setup
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: defaultAccountValues,
    mode: "onChange", // Enable real-time validation
  });

  // Extract user information from JWT token
  useEffect(() => {
    if (tokens?.access_token) {
      const decoded = decodeJWT(tokens.access_token);
      if (decoded) {
        console.log('Decoded JWT:', decoded); // Debug logging
        
        // Extract email from username field (which contains the email)
        const email = decoded.username || decoded.email || "";
        
        // Try to extract first and last name from email or other fields
        // For now, we'll use the email as the primary identifier
        const userInfo = {
          firstName: decoded.given_name || decoded.first_name || "",
          lastName: decoded.family_name || decoded.last_name || "",
          email: email,
        };
        
        console.log('Extracted user info:', userInfo); // Debug logging
        
        setDefaultAccountValues(userInfo);
        // Reset the form with the new values
        accountForm.reset(userInfo);
      }
    }
  }, [tokens]);
  
  // Watch form values for changes to enable/disable the Save button
  useEffect(() => {
    const subscription = accountForm.watch((value) => {
      const hasChanges = 
        value.firstName !== defaultAccountValues.firstName ||
        value.lastName !== defaultAccountValues.lastName ||
        value.email !== defaultAccountValues.email;
      
      setAccountFormChanged(hasChanges);
    });
    
    return () => subscription.unsubscribe();
  }, [accountForm, defaultAccountValues]);
  
  // Password form setup
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange", // Show errors while typing
  });
  
  // Account update function
  const updateAccount = async (firstName: string, lastName: string, email: string) => {
    if (!tokens?.access_token) {
      throw new Error("No authentication token available");
    }

    try {
      const updateAccountUrl = await getQuizServiceURL('/account/update-account');
      
      const response = await fetch(updateAccountUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email
        })
      });

      if (response.status === 200) {
        const responseData = await response.json();
        
        if (responseData.success) {
          // Update the default values with the new data
          const newDefaultValues = {
            firstName: responseData.data.firstName,
            lastName: responseData.data.lastName,
            email: responseData.data.email
          };
          
          // Update both the state and form
          setDefaultAccountValues(newDefaultValues);
          accountForm.reset(newDefaultValues);
          
          toast({
            title: "Account Updated",
            description: "Your account information has been successfully updated.",
            variant: "success",
          });
          return;
        }
      }
      
      // Handle error response
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Failed to update account information. Please try again.';
      
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

  // Handle account form submission
  const onAccountSubmit = async (data: AccountFormValues) => {
    setIsUpdatingAccount(true);
    
    try {
      await updateAccount(data.firstName, data.lastName, data.email);
    } catch (error) {
      console.error('Account update error:', error);
      toast({
        title: "Error",
        description: "Something went wrong while updating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAccount(false);
    }
  };
  
  // Password change function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!tokens?.access_token) {
      throw new Error("No authentication token available");
    }

    try {
      const changePasswordUrl = await getQuizServiceURL('/account/change-pass');
      
      const response = await fetch(changePasswordUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (response.status === 200) {
        const responseData = await response.json();
        
        if (responseData.success) {
          toast({
            title: "Password Changed",
            description: "Your password has been successfully updated.",
            variant: "success",
          });
          passwordForm.reset();
          return;
        }
      }
      
      // Handle error response
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Failed to change password. Please try again.';
      
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

  // Handle password form submission
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    
    try {
      await changePassword(data.currentPassword, data.newPassword);
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: "Something went wrong while changing your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    if (!tokens?.access_token) {
      throw new Error("No authentication token available");
    }

    try {
      const deleteAccountUrl = await getQuizServiceURL('/account/delete-account');
      
      const response = await fetch(deleteAccountUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (response.status === 200) {
        const responseData = await response.json();
        
        if (responseData.success) {
          toast({
            title: "Account Deleted",
            description: "Your account has been successfully deleted.",
            variant: "success",
          });
          
          // Close the dialog
          setDeleteDialogOpen(false);
          
          // Redirect to logout endpoint
          window.location.href = '/logout';
          return;
        }
      }
      
      // Handle error response
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Failed to delete account. Please try again.';
      
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

  // Handle delete account button click
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      await deleteAccount();
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: "Something went wrong while deleting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent leading-tight py-1">Settings</h1>
      </div>
      {/* Account Settings */}
      <Form {...accountForm}>
        <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="mb-8" noValidate>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-secondary mb-4">Account Settings</h3>
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
              <Button 
                type="submit"
                disabled={!accountForm.formState.isValid || isUpdatingAccount || !accountFormChanged}
              >
                {isUpdatingAccount ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Account...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </Form>
      {/* Password Settings */}
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mb-6" noValidate>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-secondary mb-4">Password Settings</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <PasswordInput {...field} />
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
                          <PasswordInput 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              // Trigger validation for confirmPassword when newPassword changes
                              passwordForm.trigger("confirmPassword");
                            }}
                          />
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
                          <PasswordInput {...field} />
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
              <Button 
                type="submit"
                disabled={!passwordForm.formState.isValid || isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </Form>
      {/* Danger Zone */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h3>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl text-red-600 font-medium">Delete Account</h3>
            <div className="mt-2 w-full text-sm text-gray-500">
              <p className="whitespace-normal">
                Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
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
            <AlertDialogDescription className="whitespace-normal">
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
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting Account...
                </>
              ) : (
                "Delete My Account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}