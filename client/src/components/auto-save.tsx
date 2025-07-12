import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface AutoSaveProps {
  data: any;
  onSave: (data: any) => Promise<void>;
  interval?: number;
  enabled?: boolean;
  showStatus?: boolean;
}

export function AutoSave({ 
  data, 
  onSave, 
  interval = 5000, 
  enabled = true,
  showStatus = true 
}: AutoSaveProps) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<any>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!enabled || !isOnline) return;

    // Check if data has changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    
    if (dataChanged && data && Object.keys(data).length > 0) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setStatus('saving');
          await onSave(data);
          setStatus('saved');
          setLastSaved(new Date());
          lastDataRef.current = data;

          // Reset to idle after showing saved status
          setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
          setStatus('error');
          toast({
            title: "Auto-save Failed",
            description: "Your changes couldn't be saved. Please check your connection.",
            variant: "destructive",
          });
        }
      }, interval);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, enabled, isOnline, interval, onSave, toast]);

  // Update status when offline
  useEffect(() => {
    if (!isOnline) {
      setStatus('offline');
    }
  }, [isOnline]);

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Save className="h-3 w-3 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case 'offline':
        return <WifiOff className="h-3 w-3 text-gray-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      case 'offline':
        return 'Offline';
      default:
        return lastSaved ? `Last saved ${formatTime(lastSaved)}` : 'Draft';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'saving':
        return 'outline' as const;
      case 'saved':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      case 'offline':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (!showStatus) return null;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={getStatusVariant()} className="text-xs">
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
      {!isOnline && (
        <Badge variant="secondary" className="text-xs">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  
  return date.toLocaleDateString();
}

export function useAutoSave() {
  const [drafts, setDrafts] = useState<Record<string, any>>({});

  const saveDraft = (key: string, data: any) => {
    setDrafts(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: new Date(),
      }
    }));
    
    // Also save to localStorage
    localStorage.setItem(`draft-${key}`, JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
    }));
  };

  const getDraft = (key: string) => {
    // Try memory first
    if (drafts[key]) {
      return drafts[key];
    }
    
    // Try localStorage
    const stored = localStorage.getItem(`draft-${key}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          data: parsed.data,
          timestamp: new Date(parsed.timestamp)
        };
      } catch {
        return null;
      }
    }
    
    return null;
  };

  const clearDraft = (key: string) => {
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[key];
      return newDrafts;
    });
    localStorage.removeItem(`draft-${key}`);
  };

  return {
    saveDraft,
    getDraft,
    clearDraft,
    drafts,
  };
}