import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertHomeownerSchema, type InsertHomeowner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Copy, Download, Printer, QrCode, LogIn, ArrowLeft, Mail, User, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { SEOHead, seoConfigs } from "@/components/seo-head";
import { SmartDefaults, useSmartDefaults } from "@/components/smart-defaults";
import { AutoSave, useAutoSave } from "@/components/auto-save";
import { KeyboardShortcuts, useKeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { StatusIndicators } from "@/components/status-indicators";
import { ProgressAnimation, useProgressSteps } from "@/components/progress-animations";
import { WelcomeMessage, useWelcomeMessage } from "@/components/welcome-messages";
import { UndoSystem, useUndoSystem } from "@/components/undo-system";

interface CreateResponse {
  success: boolean;
  message?: string;
  existingUser?: boolean;
  homeowner: {
    id: string;
    fullName: string;
    email: string;
    pitchUrl: string;
    qrUrl: string;
  };
}

interface SignInForm {
  email: string;
}

export default function Create() {
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Simplified UX state
  const [steps, setSteps] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [actions, setActions] = useState<any[]>([]);
  const homeownerDefaults = [
    {
      id: 'standard-homeowner',
      name: 'Standard Homeowner',
      description: 'Basic homeowner profile',
      data: { fullName: '', email: '' }
    }
  ];

  const form = useForm<InsertHomeowner>({
    resolver: zodResolver(insertHomeownerSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // Load draft data on mount
  useEffect(() => {
    const draft = localStorage.getItem('homeowner-create-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        form.reset(parsedDraft);
      } catch (e) {
        console.error('Error parsing draft:', e);
      }
    }

    // Set up progress steps
    setSteps([
      { id: 'validation', label: 'Validate Information', description: 'Checking your details', status: 'pending' },
      { id: 'generation', label: 'Generate QR Code', description: 'Creating your unique QR code', status: 'pending' },
      { id: 'notification', label: 'Send Welcome Email', description: 'Sending setup instructions', status: 'pending' }
    ]);

    // Add keyboard event listener
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (form.formState.isValid) {
          form.handleSubmit(onSubmit)();
        }
      } else if (e.key === 'Escape') {
        form.reset();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  // Auto-save form data
  const formData = form.watch();
  useEffect(() => {
    if (formData.fullName || formData.email) {
      localStorage.setItem('homeowner-create-draft', JSON.stringify(formData));
    }
  }, [formData.fullName, formData.email]);

  // Auto-save function for AutoSave component
  const handleAutoSave = useCallback(async (data: any) => {
    setIsSaving(true);
    try {
      localStorage.setItem('homeowner-create-draft', JSON.stringify(data));
      setLastSaved(new Date());
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Apply smart defaults
  const applyDefaults = useCallback((defaultData: Record<string, any>) => {
    form.reset({
      ...form.getValues(),
      ...defaultData,
    });
    
    setActions(prev => [...prev, {
      type: 'edit',
      description: 'Applied template defaults',
      data: form.getValues(),
      undoFunction: async () => {
        form.reset({ fullName: "", email: "" });
      }
    }]);
  }, [form]);

  // Copy functions
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Form submission handlers
  const onSubmit = (data: InsertHomeowner) => {
    createMutation.mutate(data);
  };

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 's',
      ctrlKey: true,
      description: 'Save form',
      action: () => {
        if (form.formState.isValid) {
          form.handleSubmit(onSubmit)();
        }
      }
    },
    {
      key: 'Escape',
      description: 'Reset form',
      action: () => {
        form.reset();
      }
    }
  ];

  const createMutation = useMutation({
    mutationFn: async (data: InsertHomeowner) => {
      updateStep('validation', { status: 'in-progress' });
      
      const response = await apiRequest("POST", "/api/create", data);
      const result = await response.json();
      
      // Check if user already exists
      if (!result.success && result.existingUser) {
        throw new Error("EXISTING_USER");
      }
      
      setSteps(prev => prev.map(step => 
        step.id === 'validation' ? { ...step, status: 'completed' } : step
      ));
      setSteps(prev => prev.map(step => 
        step.id === 'generation' ? { ...step, status: 'in-progress' } : step
      ));
      
      // Simulate QR generation time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSteps(prev => prev.map(step => 
        step.id === 'generation' ? { ...step, status: 'completed' } : step
      ));
      
      setSteps(prev => prev.map(step => 
        step.id === 'notification' ? { ...step, status: 'in-progress' } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 800));
      setSteps(prev => prev.map(step => 
        step.id === 'notification' ? { ...step, status: 'completed' } : step
      ));
      
      return result as CreateResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      localStorage.removeItem('homeowner-create-draft'); // Clear draft after successful creation
      
      toast({
        title: "Success!",
        description: "Your QR code has been generated.",
      });
    },
    onError: (error: any) => {
      if (error.message === "EXISTING_USER") {
        setShowSignIn(true);
        toast({
          title: "Account Already Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    },
  });

  const signinForm = useForm<SignInForm>({
    resolver: zodResolver(z.object({
      email: z.string().email("Please enter a valid email address"),
    })),
    defaultValues: {
      email: "",
    },
  });

  const signinMutation = useMutation({
    mutationFn: async (data: SignInForm) => {
      const response = await apiRequest("POST", "/api/homeowner-signin", data);
      return response.json() as Promise<CreateResponse>;
    },
    onSuccess: (data) => {
      if (data.success && data.homeowner) {
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
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

  const handleSubmit = form.handleSubmit(onSubmit);

  const handleSignIn = signinForm.handleSubmit((data) => {
    signinMutation.mutate(data);
  });

  const copyUrl = () => {
    if (result?.homeowner.pitchUrl) {
      navigator.clipboard.writeText(result.homeowner.pitchUrl);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    }
  };

  const downloadQR = () => {
    if (result?.homeowner.qrUrl) {
      const link = document.createElement('a');
      link.download = `scaninstead-qr-${result.homeowner.id}.png`;
      link.href = result.homeowner.qrUrl;
      link.click();
    }
  };

  const printQR = () => {
    if (result?.homeowner.qrUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>ScanInstead QR Code</title></head>
            <body style="text-align: center; padding: 20px;">
              <h1>ScanInstead QR Code</h1>
              <p>Scan to submit a pitch instead of knocking</p>
              <img src="${result.homeowner.qrUrl}" alt="QR Code" style="max-width: 300px;" />
              <p>Or visit: ${result.homeowner.pitchUrl}</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Show QR code result after successful creation
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
        <SEOHead {...seoConfigs.create} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Your QR Code is Ready!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your digital pitch system is now active. Display this QR code at your door or window to start receiving professional pitches.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* QR Code Display */}
            <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your QR Code</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 mb-6">
                  <img 
                    src={result.homeowner.qrUrl} 
                    alt="QR Code" 
                    className="w-56 h-56 mx-auto rounded-2xl shadow-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={downloadQR} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={printQR} variant="outline" className="flex-1 border-2">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* URL and Instructions */}
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Pitch URL</h3>
                  <div className="flex items-center space-x-3">
                    <Input 
                      value={result.homeowner.pitchUrl} 
                      readOnly 
                      className="bg-gray-50 dark:bg-gray-700 border-0 text-sm"
                    />
                    <Button size="sm" onClick={copyUrl} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Visitors can also access your pitch form directly with this URL
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Next Steps</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">Print your QR code and display it prominently at your door</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">Watch for email notifications when visitors submit pitches</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">Respond to visitors you're interested in working with</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Email Setup</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Pitches will be sent to: <strong>{result.homeowner.email}</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Make sure to check your spam folder for the first few submissions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
      <SEOHead {...seoConfigs.create} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome to ScanInstead
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Generate your digital pitch system in under 60 seconds
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
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
              {showSignIn ? "Welcome Back!" : "Get Started"}
            </CardTitle>
            <CardDescription>
              {showSignIn 
                ? "Sign in to access your existing QR code and dashboard"
                : "Create your account to generate your personalized QR code"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status indicators and auto-save */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
              {lastSaved && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Progress steps during creation */}
            {createMutation.isPending && (
              <div className="mb-6">
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500' : 
                        step.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        {step.status === 'completed' && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{step.label}</div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart defaults for homeowner registration */}
            {!showSignIn && (
              <div className="mb-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Start Templates</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">Choose a template to fill in your details quickly</p>
                  <div className="flex flex-wrap gap-2">
                    {homeownerDefaults.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyDefaults(template.data)}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showSignIn ? (
              // Sign-in form
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...signinForm.register("email")}
                    />
                  </div>
                  {signinForm.formState.errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {signinForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                      Access My QR Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // Registration form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-12 text-lg border-2 focus:border-blue-500 focus:ring-blue-500"
                      {...form.register("fullName")}
                    />
                  </div>
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-12 text-lg border-2 focus:border-blue-500 focus:ring-blue-500"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {form.formState.errors.email.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We'll send your pitch notifications to this email address
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">What happens next?</h3>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Get your unique QR code instantly</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Receive welcome email with setup instructions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Start receiving digital pitches via email</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-3"></div>
                      Creating Your QR Code...
                    </div>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5 mr-2" />
                      Generate My QR Code
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyboard shortcuts helper */}
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs border border-gray-200 dark:border-gray-700">
        <div className="font-medium mb-2">Shortcuts</div>
        <div className="space-y-1">
          <div>Ctrl+S: Save form</div>
          <div>Esc: Reset form</div>
        </div>
      </div>
      
      {/* Undo system */}
      {actions.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-xs border border-gray-200 dark:border-gray-700">
          <div className="font-medium mb-2">Recent Actions</div>
          <div className="space-y-1">
            {actions.slice(-3).map((action, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{action.description}</span>
                <button
                  onClick={() => action.undoFunction()}
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Welcome message */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Welcome!</div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Create your QR code to start receiving digital pitches from service providers.
          </div>
        </div>
      )}
    </div>
  );
}