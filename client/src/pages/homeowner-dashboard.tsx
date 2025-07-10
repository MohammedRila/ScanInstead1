import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Star, 
  MessageSquare,
  Brain,
  Shield,
  CheckCircle,
  XCircle,
  QrCode,
  Copy,
  Download,
  Settings,
  BarChart3,
  Calendar,
  FileText,
  Link as LinkIcon,
  Bell,
  Eye,
  Filter,
  Zap,
  Users,
  Target,
  MapPin,
  Activity,
  PieChart,
  TrendingDown
} from "lucide-react";
import { type Pitch } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function HomeownerDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const { data: homeowner, isLoading: homeownerLoading } = useQuery({
    queryKey: [`/api/homeowner/${id}`],
    enabled: !!id,
  });

  const { data: pitches, isLoading: pitchesLoading } = useQuery({
    queryKey: [`/api/homeowner/${id}/pitches`],
    enabled: !!id,
  });

  // Helper functions for QR code and URL management
  const copyUrl = () => {
    if (homeowner?.pitchUrl) {
      navigator.clipboard.writeText(homeowner.pitchUrl);
      toast({
        title: "URL Copied!",
        description: "Pitch URL copied to clipboard",
      });
    }
  };

  const copyQRUrl = () => {
    if (homeowner?.qrUrl) {
      navigator.clipboard.writeText(homeowner.qrUrl);
      toast({
        title: "QR Code Copied!",
        description: "QR code image copied to clipboard",
      });
    }
  };

  const downloadQR = () => {
    if (homeowner?.qrUrl) {
      const link = document.createElement('a');
      link.href = homeowner.qrUrl;
      link.download = `scaninstead-qr-${homeowner.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "QR Code Downloaded!",
        description: "QR code saved to your device",
      });
    }
  };

  if (homeownerLoading || pitchesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!homeowner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">This homeowner dashboard doesn't exist.</p>
        </div>
      </div>
    );
  }

  const pitchList = pitches?.pitches || [];
  const aiProcessedPitches = pitchList.filter((pitch: Pitch) => pitch.aiProcessed);
  const spamPitches = pitchList.filter((pitch: Pitch) => pitch.isSpam);
  const highPriorityPitches = pitchList.filter((pitch: Pitch) => pitch.urgency === 'high');
  const positivePitches = pitchList.filter((pitch: Pitch) => pitch.sentiment === 'positive');
  const recentPitches = pitchList.filter((pitch: Pitch) => {
    const now = new Date();
    const pitchDate = new Date(pitch.createdAt);
    const diffTime = Math.abs(now.getTime() - pitchDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  // Calculate statistics
  const totalViews = pitchList.length;
  const conversionRate = totalViews > 0 ? (positivePitches.length / totalViews * 100).toFixed(1) : '0';
  const avgResponseTime = '2.4'; // This would be calculated from actual data
  const uniqueBusinessTypes = [...new Set(pitchList.map(pitch => pitch.company).filter(Boolean))].length;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {homeowner.fullName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Your AI-powered ScanInstead control center
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={`px-4 py-2 text-sm font-medium ${
              homeowner.isRegistered 
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
            }`}>
              {homeowner.isRegistered ? "✅ Verified Account" : "📋 Basic Account"}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* QR Code Management Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Management
              </CardTitle>
              <CardDescription>
                Share your unique QR code with service providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Pitch URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={homeowner.pitchUrl} 
                      readOnly 
                      className="bg-gray-50 dark:bg-gray-700 text-sm"
                    />
                    <Button size="sm" onClick={copyUrl} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">QR Code Actions</Label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={downloadQR} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" onClick={copyQRUrl} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                QR Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {homeowner.qrUrl && (
                <img 
                  src={homeowner.qrUrl} 
                  alt="QR Code" 
                  className="w-32 h-32 border rounded-lg shadow-sm"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pitches</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pitchList.length}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+{recentPitches.length} this week</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{conversionRate}%</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Positive pitches</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{aiProcessedPitches.length}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Smart filtering</p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Protection</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{spamPitches.length}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Spam blocked</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how you receive pitch notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive pitches via email</p>
                  </div>
                  <Badge variant={homeowner.notificationPreference?.includes('email') ? 'default' : 'secondary'}>
                    {homeowner.notificationPreference?.includes('email') ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get instant SMS alerts</p>
                  </div>
                  <Badge variant={homeowner.notificationPreference?.includes('sms') ? 'default' : 'secondary'}>
                    {homeowner.notificationPreference?.includes('sms') ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current preference: <span className="font-medium">{homeowner.notificationPreference || 'email'}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Manage your ScanInstead account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Export All Pitches
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Business Type
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Advanced Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{highPriorityPitches.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Types</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueBusinessTypes}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentPitches.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgResponseTime}h</p>
                </div>
                <Clock className="w-8 h-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pitches List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Service Provider Pitches
            </CardTitle>
            <CardDescription>
              AI-enhanced insights for all your received pitches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {pitchList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No pitches received yet. Your QR code is ready to scan!
                </div>
              ) : (
                <div className="space-y-4">
                  {pitchList.map((pitch: Pitch) => (
                    <Card key={pitch.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {pitch.visitorName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {pitch.company || 'Company not specified'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {pitch.aiProcessed && (
                              <Badge variant="secondary" className="text-purple-600 bg-purple-50">
                                <Brain className="w-3 h-3 mr-1" />
                                AI Analyzed
                              </Badge>
                            )}
                            {pitch.isSpam && (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Spam Detected
                              </Badge>
                            )}
                            {!pitch.isSpam && (
                              <Badge variant="secondary" className="text-green-600 bg-green-50">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Legitimate
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* AI Insights */}
                        {pitch.aiProcessed && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                AI Insights
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                              {pitch.sentiment && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sentiment:</span>
                                  <Badge className={getSentimentColor(pitch.sentiment)}>
                                    {pitch.sentiment}
                                  </Badge>
                                </div>
                              )}
                              
                              {pitch.urgency && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Urgency:</span>
                                  <Badge className={getUrgencyColor(pitch.urgency)}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {pitch.urgency}
                                  </Badge>
                                </div>
                              )}
                              
                              {pitch.detectedBusinessType && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Business Type:</span>
                                  <Badge variant="outline">
                                    {pitch.detectedBusinessType}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {pitch.aiSummary && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-l-purple-500">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  AI Summary:
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {pitch.aiSummary}
                                </p>
                              </div>
                            )}

                            {pitch.categories && pitch.categories.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Categories:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {pitch.categories.map((category, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Original Pitch Content */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Service Offer:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {pitch.offer}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Why you should choose us:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {pitch.reason}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {pitch.visitorEmail && `Email: ${pitch.visitorEmail}`}
                              {pitch.visitorPhone && ` • Phone: ${pitch.visitorPhone}`}
                            </span>
                            <span>
                              {new Date(pitch.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>



                        {pitch.fileUrl && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Attachment:
                            </p>
                            <Button variant="outline" size="sm" asChild>
                              <a href={pitch.fileUrl} target="_blank" rel="noopener noreferrer">
                                {pitch.audioUrl ? "Play Audio" : "View Attachment"}
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}