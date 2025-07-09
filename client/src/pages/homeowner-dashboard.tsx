import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Volume2
} from "lucide-react";
import { type Pitch } from "@shared/schema";

export default function HomeownerDashboard() {
  const { id } = useParams<{ id: string }>();
  
  const { data: homeowner, isLoading: homeownerLoading } = useQuery({
    queryKey: [`/api/homeowner/${id}`],
    enabled: !!id,
  });

  const { data: pitches, isLoading: pitchesLoading } = useQuery({
    queryKey: [`/api/homeowner/${id}/pitches`],
    enabled: !!id,
  });

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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {homeowner.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your AI-powered ScanInstead dashboard
              </p>
            </div>
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pitches</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pitchList.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{aiProcessedPitches.length}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spam Blocked</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{spamPitches.length}</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
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

                        {/* Audio Transcript Display */}
                        {pitch.audioTranscript && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                              <Volume2 className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Audio Transcript
                              </span>
                              {pitch.audioConfidence && (
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  ({Math.round(pitch.audioConfidence * 100)}% confidence)
                                </span>
                              )}
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-l-blue-500">
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                "{pitch.audioTranscript}"
                              </p>
                            </div>
                            {pitch.audioLanguage && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Detected language: {pitch.audioLanguage}
                              </p>
                            )}
                          </div>
                        )}

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