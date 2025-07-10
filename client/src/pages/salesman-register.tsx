import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSalesmanSchema, type InsertSalesman } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, CheckCircle, Building, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Common business types - comprehensive list for door-to-door services
const BUSINESS_TYPES = [
  "Home Improvement",
  "Solar Energy",
  "Security Systems",
  "Landscaping",
  "HVAC",
  "Roofing",
  "Insurance",
  "Real Estate",
  "Pest Control",
  "Window/Siding",
  "Internet/Cable",
  "Water Treatment",
  "Cleaning Services",
  "Lawn Care",
  "Tree Services",
  "Painting",
  "Flooring",
  "Kitchen/Bath Remodeling",
  "Electrical",
  "Plumbing",
  "Concrete/Masonry",
  "Gutter Services",
  "Pool Services",
  "Moving Services",
  "Appliance Repair",
  "Handyman Services",
  "Other"
];

export default function SalesmanRegister() {
  const [location, setLocation] = useLocation();
  const [isRegistered, setIsRegistered] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [salesmanId, setSalesmanId] = useState<string | null>(null);
  const [salesmanEmail, setSalesmanEmail] = useState<string>("");
  const [showSignIn, setShowSignIn] = useState(false);
  const { toast } = useToast();

  // Check if user is already registered (from localStorage) but allow manual reset
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldReset = urlParams.get('reset') === 'true';
    
    if (shouldReset) {
      // Clear localStorage and reset all state
      localStorage.removeItem('salesmanId');
      setIsRegistered(false);
      setSalesmanId(null);
      setNeedsVerification(false);
      setShowSignIn(false);
      // Clean URL without reset parameter
      window.history.replaceState({}, '', '/salesman/register');
    } else {
      const storedSalesmanId = localStorage.getItem('salesmanId');
      if (storedSalesmanId) {
        setSalesmanId(storedSalesmanId);
        setIsRegistered(true);
      }
    }
  }, []);

  const resetRegistration = () => {
    localStorage.removeItem('salesmanId');
    setIsRegistered(false);
    setSalesmanId(null);
    setNeedsVerification(false);
    setShowSignIn(false);
    form.reset();
  };

  const form = useForm<InsertSalesman>({
    resolver: zodResolver(insertSalesmanSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      businessType: "",
      email: "",
      phone: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertSalesman) => {
      try {
        const response = await apiRequest("POST", "/api/salesman/register", data);
        return response.json();
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.needsVerification) {
        setNeedsVerification(true);
        setSalesmanEmail(data.salesman.email);
        setSalesmanId(data.salesman.id);
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account before signing in.",
        });
      } else if (data.existingUser) {
        toast({
          title: "Account Already Exists",
          description: "Please use the sign-in option instead.",
        });
        setShowSignIn(true);
      } else {
        setIsRegistered(true);
        setSalesmanId(data.salesman.id);
        localStorage.setItem('salesmanId', data.salesman.id);
        toast({
          title: "Registration Complete!",
          description: "You can now scan QR codes throughout the neighborhood.",
        });
      }
    },
    onError: (error: any) => {
      if (error.status === 409) {
        setShowSignIn(true);
        toast({
          title: "Account Already Exists",
          description: "Please use the sign-in option instead.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/salesman/verify", { email });
      return response.json();
    },
    onSuccess: (data) => {
      setNeedsVerification(false);
      setIsRegistered(true);
      setSalesmanId(data.salesman.id);
      localStorage.setItem('salesmanId', data.salesman.id);
      toast({
        title: "Email Verified!",
        description: "Your account is now active. You can start scanning QR codes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/salesman/signin", { email });
      return response.json();
    },
    onSuccess: (data) => {
      setIsRegistered(true);
      setSalesmanId(data.salesman.id);
      localStorage.setItem('salesmanId', data.salesman.id);
      toast({
        title: "Welcome Back!",
        description: "You can now access your dashboard.",
      });
    },
    onError: (error: any) => {
      if (error.status === 403) {
        setNeedsVerification(true);
        setSalesmanEmail(signInForm.getValues("email"));
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    },
  });

  const signInForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email("Valid email is required"),
    })),
    defaultValues: {
      email: "",
    },
  });

  const viewDashboard = () => {
    setLocation(`/salesman/dashboard/${salesmanId}`);
  };

  // Email verification screen
  if (needsVerification && salesmanEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Check Your Email
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            We've sent a verification email to <strong>{salesmanEmail}</strong>. 
            Please check your inbox and click verify to activate your account.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => verifyMutation.mutate(salesmanEmail)}
              disabled={verifyMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {verifyMutation.isPending ? "Verifying..." : "I've Verified My Email"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setNeedsVerification(false);
                setShowSignIn(true);
              }}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success screen after registration/verification
  if (isRegistered && salesmanId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to ScanInstead!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            You're now registered and can start scanning QR codes in the neighborhood. 
            All your scans will be tracked in your personal dashboard.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={viewDashboard}
              className="w-full bg-orange-600 hover:bg-orange-700 mb-3"
            >
              View My Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetRegistration}
              className="w-full"
            >
              Start New Registration
            </Button>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="pt-6">
                <Briefcase className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Simply scan any ScanInstead QR code to submit your pitch. 
                  No need to register again!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Service Provider Registration
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Register once and scan QR codes throughout the neighborhood. 
            Track all your interactions in one convenient dashboard.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">One Registration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Register once and scan any QR code in the neighborhood
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Building className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Track Your Scans</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See how many houses you've visited and track your progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration/Sign-in Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant={!showSignIn ? "default" : "outline"}
                onClick={() => setShowSignIn(false)}
                className="flex-1 mr-2"
              >
                Create Account
              </Button>
              <Button
                variant={showSignIn ? "default" : "outline"}
                onClick={() => setShowSignIn(true)}
                className="flex-1 ml-2"
              >
                Sign In
              </Button>
            </div>
            <CardTitle className="text-2xl">
              {showSignIn ? "Welcome Back" : "Create Your Account"}
            </CardTitle>
            <CardDescription>
              {showSignIn 
                ? "Sign in to access your service provider dashboard"
                : "This information will be saved so you don't need to re-enter it for each scan"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSignIn ? (
              // Sign-in form
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit((data) => signInMutation.mutate(data.email))} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Enter your email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={signInMutation.isPending}
                  >
                    {signInMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            ) : (
              // Registration form
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your legal first name" />
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
                        <FormLabel>Legal Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your legal last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your business name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter your email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="Enter your phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create My Account"}
                </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your information is secure and will only be used for tracking your scans and pitches.
          </p>
        </div>
      </div>
    </div>
  );
}