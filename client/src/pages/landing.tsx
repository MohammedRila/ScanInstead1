import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Wrench } from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // Track landing page view
    console.log('Landing page loaded for ID:', id);
  }, [id]);

  const handleRoleSelection = (role: 'homeowner' | 'service_provider') => {
    // Track role selection
    console.log('User selected role:', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to ScanInstead</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Choose your role to get started
          </p>
        </div>

        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500 hover:scale-105">
            <Link href={`/homeowner/welcome/${id}`} onClick={() => handleRoleSelection('homeowner')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">I'm a Homeowner</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  This is your QR code! Set up notifications to receive service offers without door knocks.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3">
                  Set Up My Notifications
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-500 hover:scale-105">
            <Link href="/salesman/register" onClick={() => handleRoleSelection('service_provider')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">I'm a Service Provider</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Register your business once and start scanning QR codes throughout the neighborhood.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-3">
                  Register My Business
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ScanInstead replaces door-to-door knocking with digital pitches
          </p>
        </div>
      </div>
    </div>
  );
}