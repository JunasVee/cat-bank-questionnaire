"use client"

import { ExamSession } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  Eye,
  Ban,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SessionCardProps {
  session: ExamSession
  onTerminate?: (sessionId: string) => void
}

export function SessionCard({ session, onTerminate }: SessionCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const diff = Math.floor((endTime.getTime() - start.getTime()) / 1000 / 60)
    return `${diff} min`
  }

  const getStatusBadge = () => {
    switch (session.status) {
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "terminated":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Terminated
          </Badge>
        )
    }
  }

  const getViolationBadge = () => {
    const count = session.violations.length
    if (count === 0) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-300">
          No Violations
        </Badge>
      )
    }
    if (count >= 3) {
      return (
        <Badge className="bg-red-500 text-white animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {count} Violations - MAX
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-300">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {count} Violation{count > 1 ? "s" : ""}
      </Badge>
    )
  }

  return (
    <Card
      className={`transition-all ${
        session.status === "in_progress" && session.violations.length >= 2
          ? "border-red-300 bg-red-50/50 shadow-red-100"
          : session.status === "in_progress"
          ? "border-blue-200 bg-blue-50/30"
          : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {session.employeeName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {session.employeeId}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            {getViolationBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{session.department}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Started: {formatTime(session.startTime)}</span>
          </div>
          <div className="text-muted-foreground">
            Duration: {formatDuration(session.startTime, session.endTime)}
          </div>
          {session.status !== "in_progress" && session.score !== undefined && (
            <div
              className={`font-medium ${
                session.passed ? "text-green-600" : "text-red-600"
              }`}
            >
              Score: {session.score}/{session.totalPoints} (
              {Math.round((session.score / (session.totalPoints || 1)) * 100)}%)
            </div>
          )}
        </div>

        {session.violations.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <p className="text-sm font-medium text-foreground mb-2">
              Violation Log:
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {session.violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded"
                >
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-1">{violation.description}</span>
                  <span className="text-red-400">
                    {formatTime(violation.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.status === "in_progress" && (
          <div className="flex gap-2 mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Details</DialogTitle>
                  <DialogDescription>
                    Monitoring {session.employeeName}&apos;s exam session
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{session.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{session.department}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Form Code</p>
                      <p className="font-medium">{session.formCode}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Time</p>
                      <p className="font-medium">
                        {formatTime(session.startTime)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Violations ({session.violations.length}/3)
                    </p>
                    {session.violations.length === 0 ? (
                      <p className="text-sm text-green-600">
                        No violations recorded
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {session.violations.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center gap-2 text-sm bg-red-50 p-2 rounded border border-red-200"
                          >
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                              <p className="text-red-700">{v.description}</p>
                              <p className="text-xs text-red-400">
                                {v.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onTerminate?.(session.id)}
            >
              <Ban className="h-4 w-4 mr-1" />
              Terminate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
