import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Users, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last updated: January 2025
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>By accessing and using ScanInstead ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
              <p>If you do not agree to abide by the above, please do not use this service.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>ScanInstead is a digital communication platform that enables property owners to receive business proposals and service offers through QR code technology, replacing traditional door-to-door solicitation.</p>
              <p>The Service includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>QR code generation for property owners</li>
                <li>Digital pitch submission system for service providers</li>
                <li>Email notification services</li>
                <li>Content filtering and analysis tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Property Owners:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate contact information</li>
                <li>Respond to legitimate business inquiries in a timely manner</li>
                <li>Report spam or inappropriate content</li>
              </ul>
              
              <h4 className="font-semibold mt-4">Service Providers:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Submit only legitimate business proposals</li>
                <li>Provide accurate business information and credentials</li>
                <li>Respect property owner preferences and responses</li>
                <li>Comply with local solicitation laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Users may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submit false, misleading, or deceptive information</li>
                <li>Use the Service for spam, harassment, or unsolicited communications</li>
                <li>Attempt to reverse engineer or compromise the platform's security</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Share QR codes or access credentials with unauthorized parties</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which forms part of these Terms of Service.</p>
              <p>By using the Service, you consent to the collection, use, and sharing of your information as described in our Privacy Policy.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The Service and its original content, features, and functionality are owned by ScanInstead and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
              <p>Users retain ownership of content they submit but grant ScanInstead a license to use, store, and display such content as necessary to provide the Service.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>ScanInstead provides the Service "as is" without warranties of any kind. We are not liable for any damages arising from the use of the Service, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Business opportunities lost or gained through the platform</li>
                <li>Quality or performance of services arranged through the platform</li>
                <li>Technical disruptions or data loss</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>If you have questions about these Terms of Service, please contact us at:</p>
              <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                Email: legal@scaninstead.com<br />
                Address: ScanInstead Legal Department<br />
                [Address to be provided]
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}