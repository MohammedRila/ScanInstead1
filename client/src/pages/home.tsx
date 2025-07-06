import { Link } from "wouter";
import { QrCode, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Replace Door Knocking with{" "}
              <span className="text-primary">Smart QR Pitches</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create a QR code for your door. Let visitors submit their pitch digitally instead of knocking. 
              Get organized submissions delivered straight to your email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/create">Create Your QR Code</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <a href="#demo">See Demo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-lg text-muted-foreground">Simple steps to modernize your door-to-door experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">1. Create Account</h4>
                <p className="text-muted-foreground">Sign up with your name and email to get your unique QR code</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">2. Display QR Code</h4>
                <p className="text-muted-foreground">Print and display your QR code at your door or window</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">3. Receive Pitches</h4>
                <p className="text-muted-foreground">Get organized submissions delivered to your email inbox</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">See It In Action</h3>
            <p className="text-lg text-muted-foreground">
              Try our demo pitch form to see what visitors experience when they scan your QR code
            </p>
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="/v/demo">Try Demo Pitch Form</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
