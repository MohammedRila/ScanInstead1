import { Link } from "wouter";
import { QrCode, UserPlus, Mail, ArrowRight, CheckCircle, Zap, Shield, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              New Launch
            </Badge>
            <span>Digital Pitch System</span>
            <span>•</span>
            <span>Modernizing Door-to-Door</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              ⚡ Smart QR Technology
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                Replace Door Knocking with Smart Digital Pitches
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Create a QR code for your door. Let visitors submit professional pitches digitally. 
              Get organized submissions delivered instantly to your email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Link href="/create">
                  Create Your QR Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                <a href="#demo">Watch Demo</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Digital Submission</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Door Interruptions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              ✨ Key Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How ScanInstead Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Transform your door-to-door experience with our intelligent QR-based system
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3 md:gap-8 md:mb-16">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
              <CardContent className="pt-8 pb-8 text-center relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quick Setup</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create your account and generate a unique QR code in under 60 seconds
                </p>
                <div className="flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Instant Generation
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
              <CardContent className="pt-8 pb-8 text-center relative z-10">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Smart QR Display</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Print and display your personalized QR code at your door or window
                </p>
                <div className="flex items-center justify-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                  <Zap className="h-4 w-4 mr-2" />
                  Mobile Optimized
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
              <CardContent className="pt-8 pb-8 text-center relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Instant Notifications</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Receive professional, organized pitch submissions directly in your inbox
                </p>
                <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400 font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure & Private
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
              🚀 Try It Now
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Experience ScanInstead</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Test our demo pitch form to see exactly what visitors experience when they scan your QR code
            </p>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Video Demo Section */}
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">Watch ScanInstead in Action</h3>
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%233B82F6'/%3E%3Cstop offset='100%25' stop-color='%238B5CF6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='white' font-size='20' font-family='Arial'%3EScanInstead Demo%3C/text%3E%3C/svg%3E"
                  >
                    <source src="/api/demo/video" type="video/mp4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <p className="text-sm">Your browser doesn't support video playback</p>
                      </div>
                    </div>
                  </video>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
                  See how easy it is to create your QR code and receive professional pitches
                </p>
              </div>
            </div>

            {/* Interactive Demo Section */}
            <div className="text-center">
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg inline-block">
                  <QrCode className="h-12 w-12 text-gray-600 dark:text-gray-300 mx-auto" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Try Interactive Demo</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Experience the visitor's journey from QR scan to pitch submission
              </p>
              <Button asChild size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg">
                <Link href="/v/demo">
                  Launch Interactive Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Modernize Your Door?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of door-to-door interactions. Create your QR code in seconds and start receiving professional digital pitches.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-6 bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
            <Link href="/create">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}