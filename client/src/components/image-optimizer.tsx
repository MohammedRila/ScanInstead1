import { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  sizes?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  loading = 'lazy',
  priority = false,
  quality = 85,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2NjY2NjYyIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setCurrentSrc(src);
  }, [src]);

  const handleError = useCallback(() => {
    setIsError(true);
    setCurrentSrc(placeholder);
  }, [placeholder]);

  // Generate responsive image URLs for different screen sizes
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [400, 800, 1200, 1600];
    return sizes.map(size => {
      const optimizedSrc = `${baseSrc}?w=${size}&q=${quality}&format=webp`;
      return `${optimizedSrc} ${size}w`;
    }).join(', ');
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      )}
      
      {/* Optimized Image */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${isError ? 'filter grayscale' : ''}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
        // Add responsive image support
        srcSet={src !== placeholder ? generateSrcSet(src) : undefined}
        sizes={sizes}
      />
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Image failed to load
          </div>
        </div>
      )}
    </div>
  );
}

// Performance monitoring for images
export function useImagePerformance() {
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
  });

  const trackImageLoad = useCallback((loadTime: number) => {
    setMetrics(prev => {
      const newTotal = prev.totalImages + 1;
      const newLoaded = prev.loadedImages + 1;
      const newAverageLoadTime = 
        (prev.averageLoadTime * prev.loadedImages + loadTime) / newLoaded;
      
      return {
        ...prev,
        totalImages: newTotal,
        loadedImages: newLoaded,
        averageLoadTime: newAverageLoadTime,
      };
    });
  }, []);

  const trackImageError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1,
      failedImages: prev.failedImages + 1,
    }));
  }, []);

  return {
    metrics,
    trackImageLoad,
    trackImageError,
  };
}

// Lazy loading utility
export function useLazyLoading() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const observe = useCallback((el: HTMLElement | null) => {
    if (el) {
      setElement(el);
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  return { isIntersecting, observe };
}