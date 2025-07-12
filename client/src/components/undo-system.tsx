import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Undo, RotateCcw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface UndoAction {
  id: string;
  type: 'delete' | 'edit' | 'create';
  description: string;
  timestamp: Date;
  data: any;
  undoFunction: () => Promise<void>;
}

interface UndoSystemProps {
  actions: UndoAction[];
  onUndo: (action: UndoAction) => void;
  maxActions?: number;
}

export function UndoSystem({ actions, onUndo, maxActions = 10 }: UndoSystemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (actions.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [actions]);

  const handleUndo = async (action: UndoAction) => {
    try {
      await action.undoFunction();
      onUndo(action);
      toast({
        title: "Action Undone",
        description: `${action.description} has been restored`,
      });
    } catch (error) {
      toast({
        title: "Undo Failed",
        description: "Unable to undo this action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const recentActions = actions.slice(-maxActions);

  if (!isVisible || recentActions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {recentActions.map((action) => (
        <Card key={action.id} className="bg-gray-900 text-white border-gray-700 shadow-lg">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">{action.description}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUndo(action)}
              className="text-white hover:text-yellow-400 p-1 h-auto"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function useUndoSystem() {
  const [actions, setActions] = useState<UndoAction[]>([]);

  const addAction = (action: Omit<UndoAction, 'id' | 'timestamp'>) => {
    const newAction: UndoAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setActions(prev => [...prev, newAction]);
  };

  const removeAction = (actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  const clearActions = () => {
    setActions([]);
  };

  return {
    actions,
    addAction,
    removeAction,
    clearActions,
  };
}