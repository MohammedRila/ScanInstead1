import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Wrench, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { SEOHead, seoConfigs } from "@/components/seo-head";

export default function SelectRole() {
  useEffect(() => {
    // Track role selection page view
    console.log('Role selection page loaded');
  }, []);

  const handleRoleSelection = (role: 'homeowner' | 'service_provider') => {
    // Track role selection
    console.log('User selected role:', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <SEOHead {...seoConfigs.selectRole} />
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 100 100">
              {/* ScanInstead Logo - QR Code with House Icon */}
              {/* QR Code Grid */}
              <rect x="10" y="10" width="6" height="6" />
              <rect x="18" y="10" width="6" height="6" />
              <rect x="26" y="10" width="6" height="6" />
              <rect x="42" y="10" width="6" height="6" />
              <rect x="58" y="10" width="6" height="6" />
              <rect x="74" y="10" width="6" height="6" />
              <rect x="82" y="10" width="6" height="6" />
              
              <rect x="10" y="18" width="6" height="6" />
              <rect x="34" y="18" width="6" height="6" />
              <rect x="50" y="18" width="6" height="6" />
              <rect x="82" y="18" width="6" height="6" />
              
              <rect x="10" y="26" width="6" height="6" />
              <rect x="26" y="26" width="6" height="6" />
              <rect x="42" y="26" width="6" height="6" />
              <rect x="58" y="26" width="6" height="6" />
              <rect x="82" y="26" width="6" height="6" />
              
              <rect x="18" y="34" width="6" height="6" />
              <rect x="34" y="34" width="6" height="6" />
              <rect x="66" y="34" width="6" height="6" />
              <rect x="82" y="34" width="6" height="6" />
              
              {/* House Icon in Center */}
              <path d="M35 45 L50 32 L65 45 L65 65 L55 65 L55 55 L45 55 L45 65 L35 65 Z" fill="white" opacity="0.9" />
              <rect x="47" y="58" width="2" height="4" fill="currentColor" opacity="0.8" />
              <rect x="51" y="58" width="2" height="4" fill="currentColor" opacity="0.8" />
              
              <rect x="10" y="50" width="6" height="6" />
              <rect x="26" y="50" width="6" height="6" />
              <rect x="74" y="50" width="6" height="6" />
              
              <rect x="18" y="58" width="6" height="6" />
              <rect x="34" y="58" width="6" height="6" />
              <rect x="74" y="58" width="6" height="6" />
              <rect x="82" y="58" width="6" height="6" />
              
              <rect x="10" y="66" width="6" height="6" />
              <rect x="26" y="66" width="6" height="6" />
              <rect x="74" y="66" width="6" height="6" />
              
              <rect x="10" y="74" width="6" height="6" />
              <rect x="34" y="74" width="6" height="6" />
              <rect x="50" y="74" width="6" height="6" />
              <rect x="66" y="74" width="6" height="6" />
              <rect x="82" y="74" width="6" height="6" />
              
              <rect x="10" y="82" width="6" height="6" />
              <rect x="18" y="82" width="6" height="6" />
              <rect x="26" y="82" width="6" height="6" />
              <rect x="42" y="82" width="6" height="6" />
              <rect x="58" y="82" width="6" height="6" />
              <rect x="74" y="82" width="6" height="6" />
              <rect x="82" y="82" width="6" height="6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to ScanInstead</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Please select your role to get started
          </p>
        </div>

        <div className="space-y-6">
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 hover:scale-105 group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <CardHeader className="text-center pb-4 pt-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                <Home className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white mb-3">I'm a Homeowner</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                Create your QR code to receive professional service offers without door-to-door interruptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-8">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Generate unique QR code instantly
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Receive organized pitch emails
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Review offers on your own time
                </div>
              </div>
              <Link href="/create" onClick={() => handleRoleSelection('homeowner')}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                  Create My QR Code
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-500 hover:scale-105 group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
            <Link href="/salesman/register" onClick={() => handleRoleSelection('service_provider')}>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300 shadow-lg">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white mb-3">I'm a Service Provider</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                  Register your business to start scanning QR codes and submitting professional pitches.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-8">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Register once, scan multiple codes
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Submit professional pitches
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Track your outreach progress
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                  Register My Business
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ScanInstead modernizes door-to-door interactions with digital pitches
          </p>
        </div>
      </div>
    </div>
  );
}