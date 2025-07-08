import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, Users, Shield, Smartphone } from "lucide-react";

export default function FAQ() {
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
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get answers to common questions about ScanInstead
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                General Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is ScanInstead?</AccordionTrigger>
                  <AccordionContent>
                    ScanInstead is a modern alternative to door-to-door solicitation. It allows homeowners to receive business proposals digitally through QR codes, eliminating unwanted knocks while maintaining opportunities for legitimate business connections.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How does it work?</AccordionTrigger>
                  <AccordionContent>
                    Homeowners create a free account and receive a unique QR code. Service providers scan the code instead of knocking, submit their business proposal digitally, and the homeowner receives an organized email notification. It's that simple!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Is ScanInstead free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes! ScanInstead is completely free for homeowners. Service providers can also submit proposals at no cost. Our mission is to improve neighborhood communications for everyone.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>What types of businesses can use this?</AccordionTrigger>
                  <AccordionContent>
                    Any legitimate service provider can use ScanInstead: contractors, landscapers, solar installers, home security, cleaning services, painters, roofers, and more. Our AI helps filter out spam and inappropriate content.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                For Homeowners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="home-1">
                  <AccordionTrigger>How do I get started as a homeowner?</AccordionTrigger>
                  <AccordionContent>
                    Simply visit our website, enter your name and email, and you'll instantly receive your unique QR code. Print it out, display it prominently, and start receiving organized digital proposals instead of door knocks.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="home-2">
                  <AccordionTrigger>Where should I display my QR code?</AccordionTrigger>
                  <AccordionContent>
                    Place your QR code where service providers can easily see it: on your front door, mailbox, or a visible window. Include a note like "Scan for business proposals - No knocking needed!"
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="home-3">
                  <AccordionTrigger>What if I receive spam or inappropriate content?</AccordionTrigger>
                  <AccordionContent>
                    Our AI automatically filters most spam before it reaches you. If something inappropriate gets through, simply report it and we'll improve our filters. You can also block specific service providers if needed.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="home-4">
                  <AccordionTrigger>Can I choose when to receive notifications?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can set your notification preferences for email and SMS. Choose immediate notifications, daily summaries, or weekly digests based on your preferences.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="home-5">
                  <AccordionTrigger>What information do service providers see about me?</AccordionTrigger>
                  <AccordionContent>
                    Service providers only see your first name and the fact that you use ScanInstead. Your email, address, and other personal details remain private until you choose to respond to their proposal.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                For Service Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="service-1">
                  <AccordionTrigger>How do I submit a proposal through ScanInstead?</AccordionTrigger>
                  <AccordionContent>
                    When you see a ScanInstead QR code, simply scan it with your phone's camera. You'll be taken to a form where you can introduce yourself, describe your services, and explain why you're reaching out. Submit the form and the homeowner will receive an organized email.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service-2">
                  <AccordionTrigger>Do I need an account to submit proposals?</AccordionTrigger>
                  <AccordionContent>
                    No account is required to submit individual proposals. However, creating a free service provider account allows you to track your submissions, build a professional profile, and access analytics about your outreach efforts.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service-3">
                  <AccordionTrigger>Can I include attachments with my proposal?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can attach business documents, photos of previous work, brochures, or other relevant files to support your proposal. This helps homeowners better understand your services and expertise.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service-4">
                  <AccordionTrigger>How do I know if a homeowner is interested?</AccordionTrigger>
                  <AccordionContent>
                    Homeowners will contact you directly using the information you provided in your proposal. Make sure to include accurate phone numbers and email addresses for the best response rates.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="service-5">
                  <AccordionTrigger>Are there guidelines for what I can submit?</AccordionTrigger>
                  <AccordionContent>
                    Yes. All proposals must be for legitimate business services. No spam, aggressive sales tactics, or inappropriate content. Be professional, respectful, and honest about your services and pricing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger>Is my personal information secure?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We use enterprise-grade security measures including encryption, secure cloud hosting, and strict access controls. We never sell your data and only use it to provide the ScanInstead service.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-2">
                  <AccordionTrigger>What devices can scan QR codes?</AccordionTrigger>
                  <AccordionContent>
                    Any modern smartphone can scan QR codes using the built-in camera app. Most phones automatically recognize QR codes when you point the camera at them. No special app download required.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-3">
                  <AccordionTrigger>What happens if I lose my QR code?</AccordionTrigger>
                  <AccordionContent>
                    No problem! Just log back into your account or contact our support team. We can quickly regenerate your QR code or send you a new copy via email.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-4">
                  <AccordionTrigger>How does the AI spam detection work?</AccordionTrigger>
                  <AccordionContent>
                    Our advanced AI analyzes incoming proposals for legitimacy, sentiment, and appropriateness. It automatically filters out obvious spam, aggressive sales tactics, and inappropriate content before they reach homeowners.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Still have questions? We're here to help!</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-sm">support@scaninstead.com</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Response within 24 hours</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Community Forum</h4>
                  <p className="text-sm">community.scaninstead.com</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Get help from other users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}