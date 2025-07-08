import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";

export default function Privacy() {
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
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last updated: January 2025
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Personal Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and email address (for account creation and notifications)</li>
                <li>Phone number (optional, for SMS notifications)</li>
                <li>Business information (for service providers)</li>
              </ul>
              
              <h4 className="font-semibold mt-4">Usage Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>QR code scan analytics (anonymous)</li>
                <li>Platform interaction data</li>
                <li>Device and browser information</li>
              </ul>

              <h4 className="font-semibold mt-4">Content Data:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service proposals and business pitches</li>
                <li>File attachments (business documents, images)</li>
                <li>Communication preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide the Service:</strong> Enable QR code generation, pitch submission, and notification delivery</li>
                <li><strong>Content Analysis:</strong> Use AI technology to filter spam and categorize business proposals</li>
                <li><strong>Communication:</strong> Send email notifications and important service updates</li>
                <li><strong>Improvement:</strong> Analyze usage patterns to enhance platform functionality</li>
                <li><strong>Security:</strong> Detect and prevent fraudulent or abusive activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
              
              <h4 className="font-semibold">Service Delivery:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Property owners receive service provider contact information through legitimate pitches</li>
                <li>Service providers' information is shared with relevant property owners</li>
              </ul>

              <h4 className="font-semibold mt-4">Legal Requirements:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>When required by law or legal process</li>
                <li>To protect our rights and safety or that of our users</li>
                <li>In connection with business transfers or acquisitions</li>
              </ul>

              <h4 className="font-semibold mt-4">Service Providers:</h4>
              <p>We work with trusted third-party services for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email delivery services</li>
                <li>Cloud storage and database management</li>
                <li>Analytics and performance monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Limited access to authorized personnel only</li>
                <li><strong>Regular Audits:</strong> Security practices reviewed and updated regularly</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on enterprise-grade cloud platforms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We retain your information for as long as necessary to provide the Service and fulfill legal obligations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Pitch History:</strong> Maintained for business records and user access</li>
                <li><strong>Analytics Data:</strong> Aggregated and anonymized for platform improvement</li>
                <li><strong>Legal Compliance:</strong> Some data may be retained longer as required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from communications at any time</li>
              </ul>
              
              <p className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <strong>Note:</strong> Some information may be retained for legal compliance even after account deletion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide security features</li>
                <li>Improve user experience</li>
              </ul>
              <p className="mt-4">You can control cookie settings through your browser preferences.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>For privacy-related questions or to exercise your rights, contact us at:</p>
              <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                Email: privacy@scaninstead.com<br />
                Data Protection Officer: dpo@scaninstead.com<br />
                Address: ScanInstead Privacy Department<br />
                [Address to be provided]
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}