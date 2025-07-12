import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  disabled?: boolean;
}

export function KeyboardShortcuts({ shortcuts, disabled = false }: KeyboardShortcutsProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey
      );

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
        
        // Show toast for keyboard action
        toast({
          title: "Keyboard Shortcut",
          description: matchedShortcut.description,
          duration: 2000,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, disabled, toast]);

  return null;
}

export function useKeyboardShortcuts() {
  const commonShortcuts = {
    save: (onSave: () => void): KeyboardShortcut => ({
      key: 's',
      ctrlKey: true,
      action: onSave,
      description: 'Save (Ctrl+S)'
    }),
    
    undo: (onUndo: () => void): KeyboardShortcut => ({
      key: 'z',
      ctrlKey: true,
      action: onUndo,
      description: 'Undo (Ctrl+Z)'
    }),
    
    redo: (onRedo: () => void): KeyboardShortcut => ({
      key: 'y',
      ctrlKey: true,
      action: onRedo,
      description: 'Redo (Ctrl+Y)'
    }),
    
    copy: (onCopy: () => void): KeyboardShortcut => ({
      key: 'c',
      ctrlKey: true,
      action: onCopy,
      description: 'Copy (Ctrl+C)'
    }),
    
    paste: (onPaste: () => void): KeyboardShortcut => ({
      key: 'v',
      ctrlKey: true,
      action: onPaste,
      description: 'Paste (Ctrl+V)'
    }),
    
    escape: (onEscape: () => void): KeyboardShortcut => ({
      key: 'Escape',
      action: onEscape,
      description: 'Cancel (Esc)'
    }),
    
    enter: (onEnter: () => void): KeyboardShortcut => ({
      key: 'Enter',
      ctrlKey: true,
      action: onEnter,
      description: 'Submit (Ctrl+Enter)'
    })
  };

  return { commonShortcuts };
}