import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Upload, 
  Download,
  Save,
  Send,
  Zap,
  Sparkles
} from 'lucide-react';

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  duration?: number;
  icon?: React.ReactNode;
}

interface ProgressAnimationProps {
  steps: ProgressStep[];
  currentStep?: string;
  showProgress?: boolean;
  showStepDetails?: boolean;
  compact?: boolean;
}

export function ProgressAnimation({ 
  steps, 
  currentStep, 
  showProgress = true,
  showStepDetails = true,
  compact = false
}: ProgressAnimationProps) {
  const [animatingStep, setAnimatingStep] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep) {
      setAnimatingStep(currentStep);
      const timer = setTimeout(() => setAnimatingStep(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const getStepIcon = (step: ProgressStep) => {
    if (step.icon) return step.icon;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepVariant = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'default' as const;
      case 'in-progress':
        return 'outline' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {showProgress && (
          <Progress value={progressPercentage} className="w-24" />
        )}
        <span className="text-sm text-gray-600">
          {completedSteps}/{steps.length} completed
        </span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        {showProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className={`mt-0.5 ${
                animatingStep === step.id ? 'animate-pulse' : ''
              }`}>
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.label}
                  </h4>
                  <Badge variant={getStepVariant(step)} className="text-xs">
                    {step.status}
                  </Badge>
                </div>
                
                {showStepDetails && step.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SaveIndicator({ 
  isSaving, 
  lastSaved, 
  error 
}: { 
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      {isSaving ? (
        <div className="flex items-center space-x-1 text-blue-600">
          <Save className="h-3 w-3 animate-pulse" />
          <span className="text-xs">Saving...</span>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">Save failed</span>
        </div>
      ) : lastSaved ? (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">
            Saved {formatTime(lastSaved)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function UploadProgress({ 
  progress, 
  fileName, 
  status 
}: { 
  progress: number;
  fileName: string;
  status: 'uploading' | 'completed' | 'error';
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          {status === 'uploading' && <Upload className="h-4 w-4 text-blue-600 animate-pulse" />}
          {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600">
            {status === 'uploading' ? 'Uploading...' : 
             status === 'completed' ? 'Upload complete' : 'Upload failed'}
          </span>
          <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionSuccess({ 
  message, 
  onClose 
}: { 
  message: string;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">{message}</span>
          <Sparkles className="h-4 w-4 text-green-600 animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

export function useProgressSteps() {
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const addStep = (step: Omit<ProgressStep, 'status'>) => {
    setSteps(prev => [...prev, { ...step, status: 'pending' }]);
  };

  const updateStep = (id: string, updates: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
    
    if (updates.status === 'in-progress') {
      setCurrentStep(id);
    }
  };

  const completeStep = (id: string) => {
    updateStep(id, { status: 'completed' });
    setCurrentStep(null);
  };

  const errorStep = (id: string) => {
    updateStep(id, { status: 'error' });
    setCurrentStep(null);
  };

  const resetSteps = () => {
    setSteps([]);
    setCurrentStep(null);
  };

  return {
    steps,
    currentStep,
    addStep,
    updateStep,
    completeStep,
    errorStep,
    resetSteps,
  };
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
}