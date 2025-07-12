import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Wand2, Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SmartDefault {
  id: string;
  name: string;
  description: string;
  icon?: string;
  data: Record<string, any>;
  category?: string;
  popular?: boolean;
}

interface SmartDefaultsProps {
  defaults: SmartDefault[];
  onApply: (defaultData: Record<string, any>) => void;
  title?: string;
  subtitle?: string;
}

export function SmartDefaults({ 
  defaults, 
  onApply, 
  title = "Quick Start Templates",
  subtitle = "Choose a template to get started quickly"
}: SmartDefaultsProps) {
  const [selectedDefault, setSelectedDefault] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApply = (defaultItem: SmartDefault) => {
    setSelectedDefault(defaultItem.id);
    onApply(defaultItem.data);
    
    toast({
      title: "Template Applied",
      description: `${defaultItem.name} template has been applied to your form`,
    });

    // Clear selection after a moment
    setTimeout(() => setSelectedDefault(null), 2000);
  };

  const groupedDefaults = defaults.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SmartDefault[]>);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedDefaults).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b pb-1">
              {category}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    selectedDefault === item.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => handleApply(item)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center">
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.name}
                        {item.popular && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </CardTitle>
                      {selectedDefault === item.id ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function useSmartDefaults() {
  // Common defaults for ScanInstead
  const pitchDefaults: SmartDefault[] = [
    {
      id: 'landscaping',
      name: 'Landscaping Service',
      description: 'Professional lawn care and garden maintenance',
      icon: '🌱',
      category: 'Home Services',
      popular: true,
      data: {
        company: 'Green Thumb Landscaping',
        offer: 'Professional lawn care and landscaping services',
        reason: 'I noticed your yard could benefit from professional maintenance. We offer weekly lawn care, seasonal cleanup, and garden design services.',
        visitorName: 'Mike Johnson',
        visitorEmail: 'mike@greenthumb.com',
        visitorPhone: '(555) 123-4567',
      }
    },
    {
      id: 'cleaning',
      name: 'House Cleaning',
      description: 'Professional residential cleaning services',
      icon: '🧹',
      category: 'Home Services',
      popular: true,
      data: {
        company: 'Sparkle Clean Services',
        offer: 'Weekly house cleaning services',
        reason: 'Save time with our professional cleaning service. We handle everything from bathrooms to kitchens, using eco-friendly products.',
        visitorName: 'Sarah Martinez',
        visitorEmail: 'sarah@sparkle.com',
        visitorPhone: '(555) 987-6543',
      }
    },
    {
      id: 'solar',
      name: 'Solar Installation',
      description: 'Solar panel installation and energy consultation',
      icon: '☀️',
      category: 'Energy',
      data: {
        company: 'SunPower Solutions',
        offer: 'Free solar energy consultation and installation',
        reason: 'Your home is perfect for solar panels! We can reduce your energy bills by 50-80% with our premium solar installation.',
        visitorName: 'David Chen',
        visitorEmail: 'david@sunpower.com',
        visitorPhone: '(555) 246-8135',
      }
    },
    {
      id: 'roofing',
      name: 'Roofing Services',
      description: 'Roof repair and replacement services',
      icon: '🏠',
      category: 'Home Services',
      data: {
        company: 'Premier Roofing Co.',
        offer: 'Free roof inspection and repair services',
        reason: 'I noticed some potential issues with your roof. We offer free inspections and can provide immediate repairs if needed.',
        visitorName: 'Tom Wilson',
        visitorEmail: 'tom@premierroofing.com',
        visitorPhone: '(555) 369-2580',
      }
    },
    {
      id: 'pest_control',
      name: 'Pest Control',
      description: 'Professional pest management services',
      icon: '🐛',
      category: 'Home Services',
      data: {
        company: 'Bug-Free Home Solutions',
        offer: 'Monthly pest control treatment',
        reason: 'Protect your home from pests year-round. Our eco-friendly treatments are safe for families and pets.',
        visitorName: 'Lisa Rodriguez',
        visitorEmail: 'lisa@bugfree.com',
        visitorPhone: '(555) 147-7890',
      }
    },
    {
      id: 'handyman',
      name: 'Handyman Services',
      description: 'General home repair and maintenance',
      icon: '🔧',
      category: 'Home Services',
      popular: true,
      data: {
        company: 'Fix-It Pro Services',
        offer: 'General home repair and maintenance',
        reason: 'From leaky faucets to painting projects, we handle all your home repair needs. Licensed and insured professionals.',
        visitorName: 'Carlos Mendez',
        visitorEmail: 'carlos@fixitpro.com',
        visitorPhone: '(555) 753-9514',
      }
    }
  ];

  const homeownerDefaults: SmartDefault[] = [
    {
      id: 'family_home',
      name: 'Family Home',
      description: 'Standard family residence setup',
      icon: '🏡',
      category: 'Residential',
      popular: true,
      data: {
        fullName: 'John and Sarah Smith',
        notificationPreference: 'email',
      }
    },
    {
      id: 'elderly_resident',
      name: 'Senior Resident',
      description: 'Setup for elderly homeowners',
      icon: '👴',
      category: 'Residential',
      data: {
        fullName: 'Robert Johnson',
        notificationPreference: 'phone',
      }
    },
    {
      id: 'young_professional',
      name: 'Young Professional',
      description: 'Busy professional homeowner',
      icon: '💼',
      category: 'Residential',
      data: {
        fullName: 'Emily Chen',
        notificationPreference: 'email',
      }
    }
  ];

  return {
    pitchDefaults,
    homeownerDefaults,
  };
}