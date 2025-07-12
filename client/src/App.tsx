import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileOptimizations } from "@/components/mobile-optimizations";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Create from "@/pages/create";
import SelectRole from "@/pages/select-role";
import Pitch from "@/pages/pitch";
import Success from "@/pages/success";
import Landing from "@/pages/landing";
import HomeownerWelcome from "@/pages/homeowner-welcome";
import SalesmanRegister from "@/pages/salesman-register";
import SalesmanVerify from "@/pages/salesman-verify";
import SalesmanDashboard from "@/pages/salesman-dashboard";
import HomeownerDashboard from "@/pages/homeowner-dashboard";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import Features from "@/pages/features";


function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/get-started" component={SelectRole} />
          <Route path="/create" component={Create} />

          <Route path="/salesman/register" component={SalesmanRegister} />
          <Route path="/l/:id" component={Landing} />
          <Route path="/homeowner/welcome/:id" component={HomeownerWelcome} />
          <Route path="/homeowner/dashboard/:id" component={HomeownerDashboard} />
          <Route path="/salesman/verify" component={SalesmanVerify} />
          <Route path="/salesman/dashboard/:id" component={SalesmanDashboard} />
          <Route path="/v/:id" component={Pitch} />
          <Route path="/success" component={Success} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/faq" component={FAQ} />
          <Route path="/features" component={Features} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <MobileOptimizations />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;