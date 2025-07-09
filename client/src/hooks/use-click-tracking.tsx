import { useState, useCallback } from 'react';

interface ClickEvent {
  timestamp: number;
  elementType: string;
  position: { x: number; y: number };
}

export function useClickTracking() {
  const [clicks, setClicks] = useState<ClickEvent[]>([]);

  const trackClick = useCallback((event: React.MouseEvent, elementType: string) => {
    const clickEvent: ClickEvent = {
      timestamp: Date.now(),
      elementType,
      position: { x: event.clientX, y: event.clientY }
    };
    
    setClicks(prev => [...prev.slice(-9), clickEvent]); // Keep last 10 clicks
  }, []);

  const getTimestamps = useCallback(() => {
    return clicks.map(click => click.timestamp);
  }, [clicks]);

  const reset = useCallback(() => {
    setClicks([]);
  }, []);

  return {
    trackClick,
    getTimestamps,
    reset,
    clickCount: clicks.length
  };
}