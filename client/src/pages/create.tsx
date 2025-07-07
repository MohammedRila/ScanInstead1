import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertHomeownerSchema, type InsertHomeowner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Download, Printer, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateResponse {
  success: boolean;
  homeowner: {
    id: string;
    fullName: string;
    email: string;
    pitchUrl: string;
    qrUrl: string;
  };
}

export default function Create() {
  const [result, setResult] = useState<CreateResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<InsertHomeowner>({
    resolver: zodResolver(insertHomeownerSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertHomeowner) => {
      const response = await apiRequest("POST", "/api/create", data);
      return response.json() as Promise<CreateResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Success!",
        description: "Your QR code has been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
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

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
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
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">📧 Email Setup</h3>
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create Your QR Code
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Generate your digital pitch system in under 60 seconds
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  className="h-14 text-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="h-14 text-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.email.message}</p>
                )}
                <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    📧 All pitch submissions will be sent to this email address
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Your QR Code...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5" />
                    <span>Generate QR Code</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">⚡</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Instant Setup</div>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">🔒</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Secure & Private</div>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">📱</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mobile Ready</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
