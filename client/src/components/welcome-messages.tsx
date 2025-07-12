import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Home, 
  Clock, 
  Sparkles, 
  Star, 
  TrendingUp,
  CheckCircle,
  Gift,
  Zap,
  Heart,
  X
} from 'lucide-react';

interface WelcomeMessageProps {
  user?: {
    fullName?: string;
    email?: string;
    isReturning?: boolean;
    lastVisit?: Date;
    totalPitches?: number;
    totalScans?: number;
  };
  type?: 'homeowner' | 'service_provider' | 'guest';
  onDismiss?: () => void;
  showStats?: boolean;
}

export function WelcomeMessage({ 
  user, 
  type = 'guest',
  onDismiss,
  showStats = true
}: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getGreeting = () => {
    const name = user?.fullName || 'there';
    const timeGreeting = `Good ${timeOfDay}`;
    
    if (user?.isReturning) {
      return `${timeGreeting}, ${name}! Welcome back to ScanInstead`;
    }
    
    return `${timeGreeting}, ${name}! Welcome to ScanInstead`;
  };

  const getPersonalizedMessage = () => {
    if (!user?.isReturning) {
      return type === 'homeowner' 
        ? "Let's get your QR code set up so you can start receiving digital pitches instead of door knocks!"
        : "Ready to start submitting professional pitches? Let's get you connected with homeowners.";
    }

    if (type === 'homeowner') {
      const pitchCount = user.totalPitches || 0;
      if (pitchCount === 0) {
        return "Your QR code is ready! Share it with service providers to start receiving pitches.";
      } else if (pitchCount < 5) {
        return `You've received ${pitchCount} pitch${pitchCount === 1 ? '' : 'es'} so far. Your digital door is working!`;
      } else {
        return `Wow! You've received ${pitchCount} pitches. You're really making the most of ScanInstead!`;
      }
    } else {
      const scanCount = user.totalScans || 0;
      if (scanCount === 0) {
        return "Ready to scan your first QR code? Find homeowners who prefer digital pitches!";
      } else if (scanCount < 10) {
        return `You've scanned ${scanCount} QR code${scanCount === 1 ? '' : 's'}. Keep building those connections!`;
      } else {
        return `Amazing! ${scanCount} scans completed. You're a ScanInstead pro!`;
      }
    }
  };

  const getStatsCards = () => {
    if (!showStats || !user?.isReturning) return null;

    const stats = [];
    
    if (type === 'homeowner') {
      stats.push({
        icon: <Home className="h-4 w-4" />,
        label: 'Pitches Received',
        value: user.totalPitches || 0,
        color: 'text-blue-600'
      });
    } else {
      stats.push({
        icon: <Zap className="h-4 w-4" />,
        label: 'QR Codes Scanned',
        value: user.totalScans || 0,
        color: 'text-green-600'
      });
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={stat.color}>{stat.icon}</div>
            <div>
              <div className="font-semibold text-lg">{stat.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getReturningUserBadge = () => {
    if (!user?.isReturning) return null;
    
    const daysSinceLastVisit = user.lastVisit 
      ? Math.floor((new Date().getTime() - user.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceLastVisit > 7) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Heart className="h-3 w-3 mr-1" />
          Missed you!
        </Badge>
      );
    } else if (daysSinceLastVisit > 0) {
      return (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {daysSinceLastVisit} day{daysSinceLastVisit === 1 ? '' : 's'} ago
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="text-xs">
          <Star className="h-3 w-3 mr-1" />
          Active today
        </Badge>
      );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className="w-80 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {getGreeting()}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getReturningUserBadge()}
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="p-1 h-auto text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {getPersonalizedMessage()}
          </p>

          {getStatsCards()}

          {!user?.isReturning && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Pro Tip
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {type === 'homeowner' 
                  ? "Print your QR code and place it where visitors can easily see it - like your front door or window!"
                  : "Look for ScanInstead QR codes on doors and windows. They mean the homeowner prefers digital pitches!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function QuickActions({ 
  type,
  onAction 
}: { 
  type: 'homeowner' | 'service_provider';
  onAction: (action: string) => void;
}) {
  const homeownerActions = [
    { id: 'view-qr', label: 'View QR Code', icon: <Home className="h-4 w-4" /> },
    { id: 'check-pitches', label: 'Check Pitches', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Star className="h-4 w-4" /> },
  ];

  const serviceProviderActions = [
    { id: 'scan-qr', label: 'Scan QR Code', icon: <Zap className="h-4 w-4" /> },
    { id: 'my-pitches', label: 'My Pitches', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Star className="h-4 w-4" /> },
  ];

  const actions = type === 'homeowner' ? homeownerActions : serviceProviderActions;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(action => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.id)}
          className="text-xs"
        >
          {action.icon}
          <span className="ml-1">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

export function useWelcomeMessage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user has seen welcome message today
    const today = new Date().toDateString();
    const lastWelcome = localStorage.getItem('lastWelcome');
    
    if (lastWelcome !== today) {
      setShowWelcome(true);
      localStorage.setItem('lastWelcome', today);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  const updateUser = (userData: any) => {
    setUser(userData);
  };

  return {
    showWelcome,
    user,
    dismissWelcome,
    updateUser,
  };
}