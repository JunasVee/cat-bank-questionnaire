"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseExamTimerReturn {
  timeRemaining: number // in seconds
  isRunning: boolean
  isExpired: boolean
  formattedTime: string
  start: () => void
  pause: () => void
  reset: () => void
}

export function useExamTimer(
  durationMinutes: number,
  onExpire?: () => void
): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onExpireRef = useRef(onExpire)

  // Update ref when callback changes
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (!isExpired && timeRemaining > 0) {
      setIsRunning(true)
    }
  }, [isExpired, timeRemaining])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setTimeRemaining(durationMinutes * 60)
    setIsRunning(false)
    setIsExpired(false)
  }, [durationMinutes, clearTimer])

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearTimer()
            setIsRunning(false)
            setIsExpired(true)
            onExpireRef.current?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return clearTimer
  }, [isRunning, clearTimer])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return {
    timeRemaining,
    isRunning,
    isExpired,
    formattedTime: formatTime(timeRemaining),
    start,
    pause,
    reset,
  }
}
