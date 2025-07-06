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
import { CheckCircle, Copy, Download, Printer } from "lucide-react";
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
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your QR Code is Ready!</h3>
                <p className="text-muted-foreground">Display this QR code at your door or window</p>
              </div>
              
              <div className="bg-white dark:bg-card rounded-lg p-6 mb-6 inline-block">
                <img 
                  src={result.homeowner.qrUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              <div className="space-y-4">
                <div className="text-left bg-white dark:bg-card rounded-lg p-4">
                  <Label className="text-sm font-medium mb-2 block">Your Pitch URL:</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={result.homeowner.pitchUrl} 
                      readOnly 
                      className="text-sm bg-muted"
                    />
                    <Button size="sm" onClick={copyUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={downloadQR} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                  <Button onClick={printQR} variant="outline" className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Create Your QR Code</CardTitle>
            <p className="text-muted-foreground">Get started in less than a minute</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
                <p className="text-sm text-muted-foreground">Pitches will be sent to this email</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Generating..." : "Generate QR Code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
