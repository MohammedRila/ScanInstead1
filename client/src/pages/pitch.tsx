import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertPitchSchema, type InsertPitch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pitch() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: homeowner, isLoading } = useQuery({
    queryKey: [`/api/homeowner/${id}`],
    enabled: !!id && id !== "demo",
  });

  const form = useForm<InsertPitch>({
    resolver: zodResolver(insertPitchSchema),
    defaultValues: {
      homeownerId: id || "",
      visitorName: "",
      company: "",
      offer: "",
      reason: "",
      visitorEmail: "",
      visitorPhone: "",
      fileName: "",
    },
  });

  const pitchMutation = useMutation({
    mutationFn: async (data: InsertPitch & { file?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "file") {
          formData.append(key, value.toString());
        }
      });
      
      if (data.file) {
        formData.append("file", data.file);
      }

      const response = await fetch(`/api/pitch/${id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit pitch");
      }

      return response.json();
    },
    onSuccess: () => {
      setLocation("/success");
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
    pitchMutation.mutate({
      ...data,
      fileName: selectedFile?.name || "",
      file: selectedFile || undefined,
    });
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "File must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!homeowner && id !== "demo") {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Invalid QR Code</h3>
                <p className="text-muted-foreground">This QR code is not valid or has expired.</p>
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
            <CardTitle className="text-3xl">Submit Your Pitch</CardTitle>
            <p className="text-muted-foreground">Share your offer with the homeowner</p>
            {id === "demo" && (
              <div className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Info className="inline h-4 w-4 mr-1" />
                  This is a demo of the pitch form visitors will see
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="visitorName">
                  Your Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="visitorName"
                  placeholder="Enter your full name"
                  {...form.register("visitorName")}
                />
                {form.formState.errors.visitorName && (
                  <p className="text-sm text-red-500">{form.formState.errors.visitorName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">
                  Company <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  {...form.register("company")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="offer">
                  Your Offer <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("offer", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your offer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscaping">Landscaping Services</SelectItem>
                    <SelectItem value="home-improvement">Home Improvement</SelectItem>
                    <SelectItem value="cleaning">Cleaning Services</SelectItem>
                    <SelectItem value="pest-control">Pest Control</SelectItem>
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="solar">Solar Installation</SelectItem>
                    <SelectItem value="security">Security Systems</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.offer && (
                  <p className="text-sm text-red-500">{form.formState.errors.offer.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Why should they choose you? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  rows={4}
                  placeholder="Describe your offer, experience, pricing, or any special deals..."
                  {...form.register("reason")}
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-500">{form.formState.errors.reason.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">
                  Attach Flyer or Brochure <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, or PNG up to 5MB</p>
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitorEmail">
                    Your Email <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="visitorEmail"
                    type="email"
                    placeholder="your@email.com"
                    {...form.register("visitorEmail")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visitorPhone">
                    Your Phone <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="visitorPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...form.register("visitorPhone")}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={pitchMutation.isPending || id === "demo"}
              >
                {id === "demo" ? "Demo Mode - Submission Disabled" : 
                 pitchMutation.isPending ? "Submitting..." : "Submit Pitch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
