'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

export default function AnalyticsProvider({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Track page views when route changes
    const url = pathname + searchParams.toString()
    
    // Send to your analytics service
    // Example for Google Analytics 4
    window.gtag?.('config', 'G-XXXXXXXX', {
      page_path: url,
    })
    
    // Track important SEO metrics (if using web vitals)
    if (window.performance) {
      // Calculate and log Core Web Vitals
      const performanceEntries = window.performance.getEntriesByType('navigation')
      if (performanceEntries.length > 0) {
        const navigationEntry = performanceEntries[0]
        // Log metrics
        console.log('Time to First Byte:', navigationEntry.responseStart - navigationEntry.requestStart)
        console.log('DOM Content Loaded:', navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime)
        console.log('Page Load Time:', navigationEntry.loadEventEnd - navigationEntry.startTime)
      }
    }
  }, [pathname, searchParams])
  
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXX');
          `,
        }}
      />
      {children}
    </>
  )
}