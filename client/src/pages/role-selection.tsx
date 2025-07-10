import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, UserCheck, QrCode } from "lucide-react";

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to ScanInstead
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your role to get started with our digital pitch system
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Homeowner Card */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center p-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                I'm a Homeowner
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
                Create a QR code for your property to receive professional pitches digitally
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Generate your unique QR code</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Display it at your door or window</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Receive professional pitches via email</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">No more door-to-door interruptions</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 text-lg">
                <Link href="/homeowner/register">
                  Create My QR Code
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Service Provider Card */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="text-center p-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                I'm a Service Provider
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
                Register to submit professional pitches by scanning homeowner QR codes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Register your business profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Scan QR codes in neighborhoods</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Submit professional pitches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Track your success analytics</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg">
                <Link href="/salesman/register?reset=true">
                  Register as Provider
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why ScanInstead?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">🚪</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">No More Knocking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Replace door-to-door visits with professional digital pitches
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Instant Setup</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get started in under 60 seconds with our simple process
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Safe & Secure</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Maintain privacy while staying connected to opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}