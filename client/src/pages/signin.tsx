import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogIn, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SigninForm = z.infer<typeof signinSchema>;

interface SigninResponse {
  success: boolean;
  message: string;
  homeowner?: {
    id: string;
    fullName: string;
    email: string;
    pitchUrl: string;
    qrUrl: string;
  };
}

export default function SignIn() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
    },
  });

  const signinMutation = useMutation({
    mutationFn: async (data: SigninForm) => {
      const response = await apiRequest("POST", "/api/signin", data);
      return response.json() as Promise<SigninResponse>;
    },
    onSuccess: (data) => {
      if (data.success && data.homeowner) {
        toast({
          title: "Welcome back!",
          description: data.message,
        });
        // Redirect to dashboard
        navigate(`/homeowner/dashboard/${data.homeowner.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your email and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    signinMutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your ScanInstead dashboard
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={signinMutation.isPending}
              >
                {signinMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/create" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create one here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}