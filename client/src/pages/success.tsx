import { Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Success() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6 text-center">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Your pitch has been sent to the homeowner.
              </p>
              <div className="bg-white dark:bg-card rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>Please do not knock on the door unless specifically requested.</strong> 
                  The homeowner will review your submission and contact you if they're interested.
                </p>
              </div>
            </div>
            
            <Button asChild>
              <Link href="/v/demo">Submit Another Pitch</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
