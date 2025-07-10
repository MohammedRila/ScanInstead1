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
import { Upload, AlertCircle, Info, User, Briefcase, Home, Mic, FileAudio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClickTracking } from "@/hooks/use-click-tracking";

export default function Pitch() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userType, setUserType] = useState<"homeowner" | "service_provider" | null>(null);
  const { toast } = useToast();
  const { trackClick, getTimestamps, reset } = useClickTracking();

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
      userType: "service_provider",
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
      
      // Add click timing data for hidden bot detection analysis
      const clickTimestamps = getTimestamps();
      if (clickTimestamps.length > 0) {
        formData.append("clickTimestamps", JSON.stringify(clickTimestamps));
      }
      
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
      const maxSize = 10 * 1024 * 1024; // 10MB (increased for audio files)
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "File must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      

    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading pitch form...</p>
        </div>
      </div>
    );
  }

  if (!homeowner && id !== "demo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">QR Code Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">This QR code is not valid or has expired. Please contact the homeowner for a new code.</p>
          <Button asChild variant="outline" className="border-2">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  // User type selection screen
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome to ScanInstead
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Before we get started, please let us know who you are so we can personalize your experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card 
              className="border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30"
              onClick={() => {
                setUserType("homeowner");
                form.setValue("userType", "homeowner");
              }}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Home className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">I'm a Homeowner</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  I want to create my own QR code to receive digital pitches instead of door-to-door visits
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30"
              onClick={() => {
                setUserType("service_provider");
                form.setValue("userType", "service_provider");
              }}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">I'm a Service Provider</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  I want to submit my business pitch to the homeowner who created this QR code
                </p>
              </CardContent>
            </Card>
          </div>

          {id === "demo" && (
            <div className="text-center">
              <div className="inline-block px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  <Info className="inline h-5 w-5 mr-2" />
                  Interactive Demo Mode - Try both options to see the experience
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show different content based on user type
  if (userType === "homeowner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Home className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome, Homeowner!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            It looks like you're interested in creating your own QR code to receive digital pitches. 
            Let's get you set up with your own ScanInstead portal!
          </p>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Your QR Code</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Click below to create your own QR code that visitors can scan to submit their business pitches digitally.
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Create My QR Code
                </Button>
              </CardContent>
            </Card>
            
            <Button 
              variant="outline" 
              onClick={() => setUserType(null)}
              className="border-2"
            >
              Back to Selection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Submit Your Pitch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Share your professional offer with the homeowner digitally
          </p>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setUserType(null)}
              className="border-2"
            >
              Back to Selection
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="visitorName" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="visitorName"
                  placeholder="Enter your full name"
                  className="h-12 text-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                  onClick={(e) => trackClick(e, 'name_input')}
                  {...form.register("visitorName")}
                />
                {form.formState.errors.visitorName && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.visitorName.message}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="company" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Company <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  className="h-12 text-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                  {...form.register("company")}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="offer" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Service <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("offer", value)}>
                  <SelectTrigger className="h-12 text-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Select your service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscaping">🌿 Landscaping Services</SelectItem>
                    <SelectItem value="home-improvement">🔨 Home Improvement</SelectItem>
                    <SelectItem value="cleaning">🧽 Cleaning Services</SelectItem>
                    <SelectItem value="pest-control">🐛 Pest Control</SelectItem>
                    <SelectItem value="roofing">🏠 Roofing</SelectItem>
                    <SelectItem value="solar">☀️ Solar Installation</SelectItem>
                    <SelectItem value="security">🔒 Security Systems</SelectItem>
                    <SelectItem value="other">💼 Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.offer && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.offer.message}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="reason" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Why should they choose you? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  rows={5}
                  placeholder="Describe your offer, experience, pricing, or any special deals you're offering..."
                  className="text-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500 resize-none"
                  onClick={(e) => trackClick(e, 'reason_textarea')}
                  {...form.register("reason")}
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-500 font-medium">{form.formState.errors.reason.message}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="file" className="text-lg font-semibold text-gray-900 dark:text-white">
                  📎 Upload Business Materials <span className="text-gray-500 dark:text-gray-400 font-normal">(Recommended)</span>
                </Label>
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-2xl p-8 text-center hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium text-lg">
                    {selectedFile ? (
                      <span className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                        ✅ {selectedFile.name}
                      </span>
                    ) : (
                      "Upload your business flyers, brochures, or portfolio"
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    📄 PDFs, Word docs, Excel sheets, PowerPoint presentations<br/>
                    📸 Images (JPG, PNG, GIF, WebP) and 🎥 Videos (MP4, AVI, MOV)<br/>
                    📁 Maximum file size: 10MB
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      💡 Pro Tip: Upload professional materials like service brochures, before/after photos, 
                      pricing sheets, or testimonials to make your pitch stand out!
                    </p>
                  </div>
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.bmp,.mp4,.avi,.mov,.wmv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="mt-4 border-2 border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/50 font-semibold"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Business File
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="visitorEmail" className="text-base font-medium text-gray-900 dark:text-white">
                      Your Email <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="visitorEmail"
                      type="email"
                      placeholder="your@email.com"
                      className="h-12 border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                      {...form.register("visitorEmail")}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="visitorPhone" className="text-base font-medium text-gray-900 dark:text-white">
                      Your Phone <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="visitorPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="h-12 border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                      {...form.register("visitorPhone")}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  💡 Providing contact details helps the homeowner reach you if they're interested
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-300 transform hover:scale-105" 
                disabled={pitchMutation.isPending || id === "demo"}
                onClick={(e) => trackClick(e, 'submit_button')}
              >
                {id === "demo" ? (
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5" />
                    <span>Demo Mode - Submission Disabled</span>
                  </div>
                ) : pitchMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting Your Pitch...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Submit Professional Pitch</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
