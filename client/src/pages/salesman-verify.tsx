import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Briefcase, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SalesmanVerify() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [salesmanData, setSalesmanData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Get email from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');

  const verifyMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/salesman/verify?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      return data;
    },
    onSuccess: (data) => {
      setSalesmanData(data.salesman);
      if (data.alreadyVerified) {
        setVerificationStatus('already-verified');
        toast({
          title: "Already Verified",
          description: "Your email was already verified. Welcome back!",
        });
      } else {
        setVerificationStatus('success');
        toast({
          title: "Email Verified!",
          description: "Your account is now active. You can start scanning QR codes.",
        });
      }
      // Store salesman ID in localStorage for dashboard access
      localStorage.setItem('salesmanId', data.salesman.id);
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Verification failed');
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (email) {
      verifyMutation.mutate(email);
    } else {
      setVerificationStatus('error');
      setErrorMessage('No email parameter found in the URL');
    }
  }, [email]);

  const goToDashboard = () => {
    if (salesmanData) {
      setLocation(`/salesman/dashboard/${salesmanData.id}`);
    }
  };

  const goToSignIn = () => {
    setLocation('/salesman/register');
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Verifying Your Email
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success' || verificationStatus === 'already-verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {verificationStatus === 'already-verified' ? 'Already Verified!' : 'Email Verified!'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {verificationStatus === 'already-verified' 
              ? 'Your email was already verified. Welcome back to ScanInstead!'
              : 'Your email has been successfully verified. Your account is now active and you can start scanning QR codes.'
            }
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={goToDashboard}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Access My Dashboard
            </Button>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="pt-6">
                <Briefcase className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You can now scan any ScanInstead QR code to submit professional pitches. 
                  All your activity will be tracked in your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Verification Failed
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {errorMessage || 'We couldn\'t verify your email address. Please try again or contact support.'}
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={goToSignIn}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Go to Sign In
          </Button>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                If you continue to have problems, please contact our support team for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}