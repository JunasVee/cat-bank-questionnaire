"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TabViolation {
  id: string
  timestamp: Date
  type: "tab-switch" | "window-blur" | "visibility-hidden"
  duration?: number // in seconds
}

export interface UseTabVisibilityReturn {
  isVisible: boolean
  isFocused: boolean
  violations: TabViolation[]
  violationCount: number
  lastViolationTime: Date | null
  resetViolations: () => void
}

export function useTabVisibility(
  onViolation?: (violation: TabViolation) => void,
  maxViolations?: number
): UseTabVisibilityReturn {
  const [isVisible, setIsVisible] = useState(true)
  const [isFocused, setIsFocused] = useState(true)
  const [violations, setViolations] = useState<TabViolation[]>([])
  const hiddenStartTime = useRef<Date | null>(null)

  const addViolation = useCallback(
    (type: TabViolation["type"], duration?: number) => {
      const violation: TabViolation = {
        id: `v-${Date.now()}`,
        timestamp: new Date(),
        type,
        duration,
      }

      setViolations((prev) => [...prev, violation])
      onViolation?.(violation)
    },
    [onViolation]
  )

  const resetViolations = useCallback(() => {
    setViolations([])
  }, [])

  useEffect(() => {
    // Handle page visibility change (tab switching)
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible"
      
      if (!visible && isVisible) {
        // Tab became hidden
        hiddenStartTime.current = new Date()
        addViolation("visibility-hidden")
      } else if (visible && !isVisible && hiddenStartTime.current) {
        // Tab became visible again - calculate duration
        const duration = Math.round(
          (new Date().getTime() - hiddenStartTime.current.getTime()) / 1000
        )
        hiddenStartTime.current = null
      }
      
      setIsVisible(visible)
    }

    // Handle window blur (clicking outside browser or switching windows)
    const handleWindowBlur = () => {
      if (isFocused) {
        setIsFocused(false)
        addViolation("window-blur")
      }
    }

    const handleWindowFocus = () => {
      setIsFocused(true)
    }

    // Handle beforeunload (attempting to close/navigate away)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
      return ""
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Set initial state
    setIsVisible(document.visibilityState === "visible")
    setIsFocused(document.hasFocus())

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("focus", handleWindowFocus)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isVisible, isFocused, addViolation])

  return {
    isVisible,
    isFocused,
    violations,
    violationCount: violations.length,
    lastViolationTime: violations.length > 0 ? violations[violations.length - 1].timestamp : null,
    resetViolations,
  }
}
