"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TabViolation {
  id: string
  timestamp: Date
  type: "tab-switch" | "window-blur" | "visibility-hidden"
}

export interface UseTabVisibilityReturn {
  violations: TabViolation[]
  violationCount: number
  lastViolationTime: Date | null
  resetViolations: () => void
}

// Minimum ms between recorded violations — prevents double-fire from
// visibilitychange + blur both firing on the same tab switch.
const COOLDOWN_MS = 4000

export function useTabVisibility(
  onViolation?: (violation: TabViolation) => void
): UseTabVisibilityReturn {
  const [violations, setViolations] = useState<TabViolation[]>([])
  const lastFiredAt = useRef<number>(0)
  // Keep a stable ref so the event handler never becomes stale
  const onViolationRef = useRef(onViolation)
  useEffect(() => { onViolationRef.current = onViolation }, [onViolation])

  const recordViolation = useCallback((type: TabViolation["type"]) => {
    const now = Date.now()
    if (now - lastFiredAt.current < COOLDOWN_MS) return   // cooldown
    lastFiredAt.current = now

    const v: TabViolation = { id: `v-${now}`, timestamp: new Date(), type }
    setViolations((prev) => [...prev, v])
    onViolationRef.current?.(v)
  }, [])

  useEffect(() => {
    // Only track tab switching via visibilitychange (not blur).
    // Using both causes double-violations on every tab switch.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        recordViolation("visibility-hidden")
      }
    }

    // Block accidental navigation away from the exam
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [recordViolation]) // recordViolation is stable (no deps)

  return {
    violations,
    violationCount: violations.length,
    lastViolationTime: violations.length > 0 ? violations[violations.length - 1].timestamp : null,
    resetViolations: () => setViolations([]),
  }
}
