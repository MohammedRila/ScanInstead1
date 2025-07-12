import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  QrCode, 
  Mail, 
  Shield, 
  Brain, 
  Smartphone, 
  Clock, 
  Users, 
  BarChart3,
  FileText,
  Bell,
  Zap
} from "lucide-react";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Platform Features</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how ScanInstead revolutionizes neighborhood business communications with cutting-edge technology and user-friendly design.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-blue-600" />
                Instant QR Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Get your personalized QR code instantly. High-quality, scannable codes that work with any smartphone camera.
              </p>
              <Badge variant="secondary">Core Feature</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI-Powered Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Advanced machine learning automatically detects and filters spam, ensuring you only receive legitimate business proposals.
              </p>
              <Badge variant="secondary">AI Technology</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-green-600" />
                Smart Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Receive beautifully formatted email notifications with all proposal details, attachments, and contact information.
              </p>
              <Badge variant="secondary">Communication</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Your contact information stays private until you choose to respond. Enterprise-grade security protects your data.
              </p>
              <Badge variant="secondary">Security</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-orange-600" />
                Mobile Optimized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Works seamlessly on any device. Service providers can submit proposals directly from their smartphones.
              </p>
              <Badge variant="secondary">Mobile First</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                File Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Service providers can include business documents, photos, brochures, and portfolios with their proposals.
              </p>
              <Badge variant="secondary">Enhanced</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                For Homeowners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Time-Saving Benefits
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• No more interruptions during dinner or family time</li>
                    <li>• Review proposals at your convenience</li>
                    <li>• Compare multiple offers side-by-side</li>
                    <li>• Organized email archive of all proposals</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    Smart Management
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Customizable notification preferences</li>
                    <li>• Automatic spam and duplicate detection</li>
                    <li>• Business type categorization</li>
                    <li>• Priority flagging for urgent services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                For Service Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Professional Presentation</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Structured proposal format ensures all details are included</li>
                    <li>• Professional email delivery builds credibility</li>
                    <li>• Attachment support for portfolios and credentials</li>
                    <li>• Contact information prominently displayed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Efficiency & Analytics</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Track submission success rates and response times</li>
                    <li>• Neighborhood coverage mapping</li>
                    <li>• Professional service provider profiles</li>
                    <li>• Integration with business workflow systems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Content Analysis</h4>
                  <p className="text-blue-100">
                    Our AI analyzes proposal sentiment, business legitimacy, and content quality to ensure homeowners receive only relevant, professional communications.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Smart Categorization</h4>
                  <p className="text-blue-100">
                    Automatically categorizes services (roofing, landscaping, solar, etc.) and assesses urgency levels to help homeowners prioritize responses.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Continuous Learning</h4>
                  <p className="text-blue-100">
                    The system learns from user feedback to continuously improve spam detection and proposal quality assessment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration & Compatibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">Email Providers</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Gmail, Outlook, Apple Mail, and more</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">Mobile Devices</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">iOS, Android, all modern smartphones</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">File Formats</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">PDF, JPG, PNG, DOC, Excel files</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">Accessibility</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">WCAG compliant, screen reader friendly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to modernize your neighborhood communications?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of homeowners and service providers who have already made the switch to digital proposals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/create">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                  Get Started - Free
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="px-8">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}