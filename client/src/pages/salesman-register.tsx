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
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, CheckCircle, Building, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Common business types - you can expand this list
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
  "Other"
];

export default function SalesmanRegister() {
  const [location, setLocation] = useLocation();
  const [isRegistered, setIsRegistered] = useState(false);
  const [salesmanId, setSalesmanId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already registered (from localStorage)
  useEffect(() => {
    const storedSalesmanId = localStorage.getItem('salesmanId');
    if (storedSalesmanId) {
      setSalesmanId(storedSalesmanId);
      setIsRegistered(true);
    }
  }, []);

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
      const response = await apiRequest("/api/salesman/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setIsRegistered(true);
      setSalesmanId(data.salesman.id);
      localStorage.setItem('salesmanId', data.salesman.id);
      toast({
        title: "Registration Complete!",
        description: "You can now scan QR codes throughout the neighborhood. Your scans will be tracked in your dashboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const viewDashboard = () => {
    setLocation(`/salesman/dashboard/${salesmanId}`);
  };

  if (isRegistered && salesmanId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Welcome to ScanInstead!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            You're now registered and can start scanning QR codes in the neighborhood. 
            All your scans will be tracked in your personal dashboard.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={viewDashboard}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              View My Dashboard
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

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              This information will be saved so you don't need to re-enter it for each scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your first name" />
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
                          <Input {...field} placeholder="Enter your last name" />
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