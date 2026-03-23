'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export default function NavigationEvents() {
  const pathname = usePathname()
  const [message, setMessage] = useState('')
  const hasNavigated = useRef(false)
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Localization
  const Global = useTranslations('Global');

  // Fires when pathname changes — i.e. navigation completed
  useEffect(() => {
    // Skip the initial mount so screen readers don't announce on page load
    if (!hasNavigated.current) {
      hasNavigated.current = true
      return
    }

    // Navigation completed, clear any pending fallback timers and announce page loaded
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current)
    }


    NProgress.done()
    setMessage(Global('messaging.pageLoaded'))
  }, [pathname])

  // Listen for navigation start events dispatched by TransitionLink component
  useEffect(() => {
    const handleStart = () => {
      setMessage(Global('messaging.loadingPage'))

      // Clear any existing fallback
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current)
      }

      // Fallback in case navigation stalls or takes a long time — this ensures the user gets feedback even if something goes wrong with the navigation or NProgress
      fallbackTimer.current = setTimeout(() => {
        NProgress.done()
      }, 5000)
    }
    window.addEventListener('app:navigation:start', handleStart)
    return () => window.removeEventListener('app:navigation:start', handleStart)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}