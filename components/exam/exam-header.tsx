"use client"

import { Clock, AlertTriangle, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ExamHeaderProps {
  title: string
  formCode: string
  formattedTime: string
  timeRemaining: number
  violationCount: number
  maxViolations: number
  currentQuestion: number
  totalQuestions: number
}

export function ExamHeader({
  title,
  formCode,
  formattedTime,
  timeRemaining,
  violationCount,
  maxViolations,
  currentQuestion,
  totalQuestions,
}: ExamHeaderProps) {
  const isLowTime = timeRemaining < 300 // Less than 5 minutes
  const isCriticalTime = timeRemaining < 60 // Less than 1 minute

  return (
    <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground border-b-4 border-primary">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-lg">CAT</span>
              </div>
              <div>
                <h1 className="font-semibold text-sm leading-tight">{title}</h1>
                <p className="text-xs text-secondary-foreground/70">{formCode}</p>
              </div>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="hidden sm:flex items-center gap-2">
            <FileText className="h-4 w-4 text-secondary-foreground/70" />
            <span className="text-sm">
              Question {currentQuestion} of {totalQuestions}
            </span>
          </div>

          {/* Right: Timer and Violations */}
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isCriticalTime
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : isLowTime
                  ? "bg-orange-500 text-white"
                  : "bg-secondary-foreground/10"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono font-semibold text-sm">{formattedTime}</span>
            </div>

            {/* Violations Counter */}
            {violationCount > 0 && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>
                  {violationCount}/{maxViolations}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-1 bg-secondary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
