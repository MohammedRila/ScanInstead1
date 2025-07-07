import { Link } from "wouter";
import { CheckCircle, ArrowRight, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Success() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Pitch Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Your professional pitch has been delivered to the homeowner's inbox. 
            They'll review your submission and contact you if interested.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Email Delivered</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your pitch has been sent as a professional email with all your details and attachments
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Home className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">No Door Knocking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Please respect the homeowner's digital preference and avoid knocking on their door
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-2xl p-6 mb-8 border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Important Guidelines</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <p><strong>Do not knock on the door</strong> unless specifically requested by the homeowner</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <p>The homeowner will review your submission and contact you if interested</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">📧</span>
                  </div>
                  <p>Check your email for any follow-up questions or requests</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Link href="/v/demo">
                  Try Demo Again
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Link href="/">
                  Back to Home
                  <Home className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
