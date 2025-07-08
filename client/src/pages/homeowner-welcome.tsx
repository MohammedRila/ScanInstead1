import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHomeownerSchema, type InsertHomeowner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Home, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomeownerWelcome() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertHomeowner>({
    resolver: zodResolver(insertHomeownerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      notificationPreference: "email",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertHomeowner) => {
      const response = await apiRequest(`/api/homeowner/register/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      setIsRegistered(true);
      toast({
        title: "Registration Complete!",
        description: "You're now ScanInstead certified and will receive notifications when salespeople scan your QR code.",
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

  // Check if homeowner is already registered
  const { data: homeowner, isLoading } = useQuery({
    queryKey: [`/api/homeowner/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!homeowner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">QR Code Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">This QR code doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  if (isRegistered || homeowner?.isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 ScanInstead Certified!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            You're all set! You'll receive notifications whenever a service provider scans your QR code.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your information is secure and you can manage your preferences anytime.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Business Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to ScanInstead
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're revolutionizing door-to-door sales with digital QR code technology. 
            No more unexpected knocks - just organized, respectful business pitches delivered digitally.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Homeowners Protected</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">95%</h3>
              <p className="text-gray-600 dark:text-gray-300">Fewer Door Knocks</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">100%</h3>
              <p className="text-gray-600 dark:text-gray-300">Digital & Organized</p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get ScanInstead Certified</CardTitle>
            <CardDescription>
              Register once to receive notifications when salespeople scan your QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your full name" />
                      </FormControl>
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

                <FormField
                  control={form.control}
                  name="notificationPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How would you like to be notified?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email">Email only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phone" id="phone" />
                            <Label htmlFor="phone">Text message only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both">Both email and text</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Get ScanInstead Certified"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your information is secure and will only be used for scan notifications.
          </p>
        </div>
      </div>
    </div>
  );
}