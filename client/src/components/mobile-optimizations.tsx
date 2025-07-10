
import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export function MobileOptimizations() {
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (isMobile) {
      // Prevent zoom on input focus for iOS
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      }

      // Add mobile-specific styles
      document.documentElement.style.setProperty('--mobile-optimized', '1')
    } else {
      // Reset viewport for desktop
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1')
      }
      
      document.documentElement.style.removeProperty('--mobile-optimized')
    }
  }, [isMobile])

  return null
}
