import { useEffect, useState } from 'react';

export function MobileOptimizations() {
  const [isTouch, setIsTouch] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    // Detect touch device
    const detectTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Initial detection
    detectTouch();
    handleOrientationChange();

    // Add event listeners
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Optimize viewport for mobile
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Prevent zoom on iOS Safari
    const preventZoom = (e: Event) => {
      if (e.target instanceof HTMLInputElement && isTouch) {
        e.target.style.fontSize = '16px';
      }
    };

    document.addEventListener('focusin', preventZoom);
    document.addEventListener('focusout', (e) => {
      if (e.target instanceof HTMLInputElement && isTouch) {
        e.target.style.fontSize = '';
      }
    });

    // Optimize scroll behavior
    document.body.style.overscrollBehavior = 'none';
    document.body.style.touchAction = 'pan-x pan-y';

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('focusin', preventZoom);
    };
  }, [isTouch]);

  // Add CSS optimizations for mobile
  useEffect(() => {
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
      @media (max-width: 768px) {
        /* Optimize touch targets */
        button, a, input, textarea, select {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Improve text readability */
        body {
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        /* Optimize scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Prevent selection on UI elements */
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Optimize animations for mobile */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      }
      
      /* PWA safe area support */
      @supports (padding: env(safe-area-inset-top)) {
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .safe-area-left {
          padding-left: env(safe-area-inset-left);
        }
        .safe-area-right {
          padding-right: env(safe-area-inset-right);
        }
      }
    `;
    
    document.head.appendChild(mobileStyles);
    
    return () => {
      document.head.removeChild(mobileStyles);
    };
  }, []);

  return (
    <>
      {/* Add service worker for PWA capabilities */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                    console.log('SW registered: ', registration);
                  })
                  .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />
      
      {/* Performance hints for mobile */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="//api.scaninstead.com" />
      
      {/* Apple-specific optimizations */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ScanInstead" />
      
      {/* Android-specific optimizations */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Disable automatic phone number detection */}
      <meta name="format-detection" content="telephone=no" />
      
      {/* Optimize for status bar */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    </>
  );
}