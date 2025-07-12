import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

export function SEOHead({ 
  title = "ScanInstead - Digital Door-to-Door Pitch System",
  description = "Replace door-to-door knocking with QR-based digital pitches. Homeowners create QR codes, service providers submit professional pitches electronically.",
  keywords = "QR code, digital pitch, door-to-door, service provider, homeowner, digital marketing, lead generation",
  canonical,
  ogImage = "/og-image.jpg",
  structuredData
}: SEOProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }
    
    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
    
    // Update Open Graph tags
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', title);
    }
    
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      ogDescMeta.setAttribute('content', description);
    }
    
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', `${window.location.origin}${ogImage}`);
    }
    
    // Update Twitter tags
    const twitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitleMeta) {
      twitterTitleMeta.setAttribute('content', title);
    }
    
    const twitterDescMeta = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescMeta) {
      twitterDescMeta.setAttribute('content', description);
    }
    
    const twitterImageMeta = document.querySelector('meta[property="twitter:image"]');
    if (twitterImageMeta) {
      twitterImageMeta.setAttribute('content', `${window.location.origin}${ogImage}`);
    }
    
    // Add structured data
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
      
      // Cleanup function
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [title, description, keywords, canonical, ogImage, structuredData]);
  
  return null;
}

// Page-specific SEO configurations
export const seoConfigs = {
  home: {
    title: "ScanInstead - Digital Door-to-Door Pitch System | QR Code Service Platform",
    description: "Replace door-to-door knocking with QR-based digital pitches. Homeowners create QR codes, service providers submit professional pitches electronically. Get organized submissions without interruptions.",
    keywords: "QR code, digital pitch, door-to-door, service provider, homeowner, digital marketing, lead generation, business pitch, contact system",
    canonical: "https://scaninstead.replit.app",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "ScanInstead - Digital Pitch System",
      "description": "Replace door-to-door knocking with QR-based digital pitches",
      "url": "https://scaninstead.replit.app",
      "mainEntity": {
        "@type": "Service",
        "name": "Digital Pitch System",
        "description": "QR code-based service for connecting homeowners with service providers",
        "provider": {
          "@type": "Organization",
          "name": "ScanInstead"
        }
      }
    }
  },
  
  create: {
    title: "Create Your QR Code - ScanInstead | Free Digital Pitch System",
    description: "Create your unique QR code to start receiving professional service pitches digitally. Free setup, instant generation, organized email delivery.",
    keywords: "create QR code, generate QR code, digital pitch, homeowner registration, service pitch system",
    canonical: "https://scaninstead.replit.app/create",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Create QR Code - ScanInstead",
      "description": "Create your unique QR code for receiving digital service pitches",
      "url": "https://scaninstead.replit.app/create",
      "potentialAction": {
        "@type": "CreateAction",
        "target": "https://scaninstead.replit.app/create",
        "object": {
          "@type": "DigitalDocument",
          "name": "QR Code"
        }
      }
    }
  },
  
  selectRole: {
    title: "Get Started - Choose Your Role | ScanInstead Digital Pitch System",
    description: "Are you a homeowner looking to receive digital pitches, or a service provider wanting to submit professional proposals? Choose your role to get started.",
    keywords: "homeowner, service provider, role selection, digital pitch, QR code system",
    canonical: "https://scaninstead.replit.app/get-started",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Role Selection - ScanInstead",
      "description": "Choose your role: homeowner or service provider",
      "url": "https://scaninstead.replit.app/get-started"
    }
  },
  
  pitch: {
    title: "Submit Your Professional Pitch - ScanInstead Digital System",
    description: "Submit your professional service pitch digitally. Upload materials, provide contact details, and connect with homeowners efficiently.",
    keywords: "submit pitch, digital pitch, service provider, professional proposal, business pitch",
    canonical: "https://scaninstead.replit.app/pitch",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Submit Pitch - ScanInstead",
      "description": "Submit your professional service pitch digitally",
      "url": "https://scaninstead.replit.app/pitch",
      "potentialAction": {
        "@type": "CommunicateAction",
        "target": "https://scaninstead.replit.app/pitch",
        "object": {
          "@type": "Message",
          "name": "Service Pitch"
        }
      }
    }
  }
};