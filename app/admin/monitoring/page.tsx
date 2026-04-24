"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExamSession, ViolationRecord } from "@/lib/types"
import { mockExamSessions } from "@/lib/mock-sessions"
import { SessionCard } from "@/components/admin/session-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Bell,
  BellRing,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function MonitoringPage() {
  const [sessions, setSessions] = useState<ExamSession[]>(mockExamSessions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [violationFilter, setViolationFilter] = useState<string>("all")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newViolations, setNewViolations] = useState<ViolationRecord[]>([])
  const [showViolationAlert, setShowViolationAlert] = useState(false)
  const [latestViolation, setLatestViolation] = useState<{
    session: ExamSession
    violation: ViolationRecord
  } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(
    null
  )

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random violation (10% chance every 5 seconds)
      if (Math.random() < 0.1) {
        const inProgressSessions = sessions.filter(
          (s) => s.status === "in_progress"
        )
        if (inProgressSessions.length > 0) {
          const randomSession =
            inProgressSessions[
              Math.floor(Math.random() * inProgressSessions.length)
            ]

          // Only add violation if under 3
          if (randomSession.violations.length < 3) {
            const newViolation: ViolationRecord = {
              id: `v-${Date.now()}`,
              type: Math.random() > 0.5 ? "tab_switch" : "window_blur",
              timestamp: new Date(),
              description:
                Math.random() > 0.5
                  ? "Switched to another browser tab"
                  : "Clicked outside the exam window",
            }

            setSessions((prev) =>
              prev.map((s) => {
                if (s.id === randomSession.id) {
                  const updatedViolations = [...s.violations, newViolation]
                  return {
                    ...s,
                    violations: updatedViolations,
                    // Auto-terminate if 3 violations
                    status:
                      updatedViolations.length >= 3 ? "terminated" : s.status,
                    endTime:
                      updatedViolations.length >= 3 ? new Date() : s.endTime,
                    score: updatedViolations.length >= 3 ? 0 : s.score,
                    totalPoints:
                      updatedViolations.length >= 3 ? 25 : s.totalPoints,
                    passed: updatedViolations.length >= 3 ? false : s.passed,
                  }
                }
                return s
              })
            )

            // Show alert
            setLatestViolation({ session: randomSession, violation: newViolation })
            setShowViolationAlert(true)
            setNewViolations((prev) => [newViolation, ...prev])

            // Play sound if enabled
            if (soundEnabled) {
              const audio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleCAGYLfh2oBGFBtUp9vdlUI2J4G86M52TDIyfMPswn5SQi5zr+rThVxLOX677cttXk47cKvq1Y9nVUR7uenHdmFTPXWu6dOOaVpMgLjnwXZjVUF7suzLemVYSH+36saAaFxNhbnlvnJkWER+t+3KfWdaS4G46cV+aV1PhLvownZmXEmBuerIgGtfUIi96MB0Z15KhLvpwXdoX0yHvum/c2deS4a96r1yaF5Lh73qu3FpXkyIvuq6cGlfTIi+6rpwaV5MiL3pu3BoX0yHvuq8cmhfS4i+6rxxaF9MiL7qunBpX0yIveq7cWlfTIe96rpwaV5NiL7qu3BoX0yHvum8cmhfS4i+6rxxaF9MiL7qunBpX0yIveq7cWlfTIe96rpwaV5NiL7qu3BoX0yHvum8cmhfS4i+6rxxaF9MiL7qunBpX0yIveq7cWlfTIe96rpwaV5NiL7qu3BoX0yHvum8cmhfS4i+6rxxaF9MiL7qunBpX0yI"
              )
              audio.volume = 0.5
              audio.play().catch(() => {})
            }

            // Auto-hide alert after 5 seconds
            setTimeout(() => {
              setShowViolationAlert(false)
            }, 5000)
          }
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [sessions, soundEnabled])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleTerminate = (sessionId: string) => {
    setSessionToTerminate(sessionId)
    setShowTerminateDialog(true)
  }

  const confirmTerminate = () => {
    if (sessionToTerminate) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionToTerminate
            ? {
                ...s,
                status: "terminated" as const,
                endTime: new Date(),
                score: 0,
                totalPoints: 25,
                passed: false,
              }
            : s
        )
      )
    }
    setShowTerminateDialog(false)
    setSessionToTerminate(null)
  }

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || session.status === statusFilter

    const matchesViolation =
      violationFilter === "all" ||
      (violationFilter === "with_violations" &&
        session.violations.length > 0) ||
      (violationFilter === "no_violations" && session.violations.length === 0)

    return matchesSearch && matchesStatus && matchesViolation
  })

  // Stats
  const stats = {
    total: sessions.length,
    inProgress: sessions.filter((s) => s.status === "in_progress").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    terminated: sessions.filter((s) => s.status === "terminated").length,
    withViolations: sessions.filter((s) => s.violations.length > 0).length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Editor
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Exam Monitoring Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Form: CAT-EMP-2024-001
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 mr-1" />
                    Sound On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 mr-1" />
                    Sound Off
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              {newViolations.length > 0 && (
                <Badge className="bg-red-500 text-white">
                  <BellRing className="h-3 w-3 mr-1" />
                  {newViolations.length} New
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Violation Alert Banner */}
      {showViolationAlert && latestViolation && (
        <div className="bg-red-500 text-white py-3 px-4 animate-pulse">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                VIOLATION DETECTED: {latestViolation.session.employeeName} (
                {latestViolation.session.employeeId}) -{" "}
                {latestViolation.violation.description}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600"
              onClick={() => setShowViolationAlert(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-700">
                  {stats.inProgress}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-700">
                  {stats.completed}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Terminated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-700">
                  {stats.terminated}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">
                With Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold text-amber-700">
                  {stats.withViolations}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={violationFilter} onValueChange={setViolationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by violations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="with_violations">With Violations</SelectItem>
              <SelectItem value="no_violations">No Violations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Session Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onTerminate={handleTerminate}
            />
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sessions match your filters</p>
          </div>
        )}
      </main>

      {/* Terminate Confirmation Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Exam Session?</DialogTitle>
            <DialogDescription>
              This will immediately end the exam for this employee. Their
              current progress will be marked as terminated with a score of 0.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTerminateDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmTerminate}>
              Terminate Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
