import { useCallback, useRef } from 'react';

export function useClickTracking() {
  const clickTimestamps = useRef<number[]>([]);

  const trackClick = useCallback((event: React.MouseEvent, elementId?: string) => {
    const timestamp = Date.now();
    clickTimestamps.current.push(timestamp);
    
    // Keep only last 10 clicks for performance
    if (clickTimestamps.current.length > 10) {
      clickTimestamps.current = clickTimestamps.current.slice(-10);
    }

    // Track click metadata
    const clickData = {
      timestamp,
      elementId,
      x: event.clientX,
      y: event.clientY,
      target: (event.target as HTMLElement)?.tagName,
      className: (event.target as HTMLElement)?.className,
    };

    // Send analytics data (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'engagement',
        event_label: elementId || 'unknown',
        custom_parameter_1: JSON.stringify(clickData)
      });
    }
  }, []);

  const getClickPattern = useCallback(() => {
    const timestamps = clickTimestamps.current;
    if (timestamps.length < 2) return null;

    // Calculate time differences between clicks
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    // Calculate average interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Detect patterns
    const isRapidClicking = avgInterval < 200; // Less than 200ms between clicks
    const isSlowClicking = avgInterval > 2000; // More than 2s between clicks
    const isRegularPattern = intervals.every(interval => Math.abs(interval - avgInterval) < 500);

    return {
      avgInterval,
      isRapidClicking,
      isSlowClicking,
      isRegularPattern,
      totalClicks: timestamps.length,
      clickFrequency: timestamps.length / ((Date.now() - timestamps[0]) / 1000) // clicks per second
    };
  }, []);

  return {
    trackClick,
    getClickPattern,
    clickCount: clickTimestamps.current.length
  };
}