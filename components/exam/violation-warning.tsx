"use client"

import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TabViolation } from "@/hooks/use-tab-visibility"

interface ViolationWarningProps {
  open: boolean
  onClose: () => void
  violation: TabViolation | null
  violationCount: number
  maxViolations: number
}

export function ViolationWarning({
  open,
  onClose,
  violation,
  violationCount,
  maxViolations,
}: ViolationWarningProps) {
  const remainingWarnings = maxViolations - violationCount

  const getViolationMessage = () => {
    if (!violation) return ""
    switch (violation.type) {
      case "tab-switch":
      case "visibility-hidden":
        return "You switched away from the exam tab."
      case "window-blur":
        return "You clicked outside the exam window."
      default:
        return "Suspicious activity detected."
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-destructive">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Warning: Potential Cheating Detected
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-3">
            <p className="font-medium text-foreground">{getViolationMessage()}</p>
            <p>
              Leaving the exam window is not allowed. This incident has been
              recorded and will be reviewed.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium text-destructive">
                Violations: {violationCount} / {maxViolations}
              </p>
              {remainingWarnings > 0 ? (
                <p className="text-xs mt-1 text-muted-foreground">
                  You have {remainingWarnings} warning{remainingWarnings !== 1 ? "s" : ""}{" "}
                  remaining before automatic submission.
                </p>
              ) : (
                <p className="text-xs mt-1 text-destructive font-medium">
                  Maximum violations reached. Your exam will be submitted.
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            I Understand - Continue Exam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
