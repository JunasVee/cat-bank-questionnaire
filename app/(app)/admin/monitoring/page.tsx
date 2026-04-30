"use client"

import { useState, useEffect, useRef } from "react"
import { ExamSession, ViolationRecord } from "@/lib/types"
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

const POLL_INTERVAL_MS = 10000

export default function MonitoringPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([])
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
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null)

  const prevSessionsRef = useRef<ExamSession[]>([])

  async function fetchSessions(showRefreshIndicator = false) {
    if (showRefreshIndicator) setIsRefreshing(true)
    try {
      const res = await fetch("/api/sessions")
      if (!res.ok) return
      const raw = await res.json()
      // Convert date strings → Date objects (JSON doesn't preserve Date types)
      const data: ExamSession[] = raw.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        violations: s.violations.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })),
      }))

      // Detect new violations compared to previous fetch
      const prev = prevSessionsRef.current
      const prevViolationIds = new Set(
        prev.flatMap((s) => s.violations.map((v) => v.id))
      )

      for (const session of data) {
        for (const violation of session.violations) {
          if (!prevViolationIds.has(violation.id)) {
            setLatestViolation({ session, violation })
            setShowViolationAlert(true)
            setNewViolations((pv) => [violation, ...pv])
            if (soundEnabled) {
              const audio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleCAGYLfh2oBGFBtUp9vdlUI2J4G86M52TDIyfMPswn5SQi5zr+rThVxLOX677cttXk47cKvq1Y9nVUR7uenHdmFTPXWu6dOOaVpMgLjnwXZjVUF7suzLemVYSH+36saAaFxNhbnlvnJkWER+t+3KfWdaS4G46cV+aV1PhLvownZmXEmBuerIgGtfUIi96MB0Z15KhLvpwXdoX0yHvum/c2deS4a96r1yaF5Lh73qu3FpXkyIvuq6cGlfTIi+6rpwaV5NiL7qu3BoX0yHvum8cmhfS4i+6rxxaF9MiL7qunBpX0yIveq7cWlfTIe96rpwaV5NiL7qu3BoX0yHvum8cmhfS4i+6rxxaF9MiL7qunBpX0yI"
              )
              audio.volume = 0.5
              audio.play().catch(() => {})
            }
            setTimeout(() => setShowViolationAlert(false), 5000)
          }
        }
      }

      prevSessionsRef.current = data
      setSessions(data)
    } catch (err) {
      console.error("Failed to fetch sessions", err)
    } finally {
      if (showRefreshIndicator) setIsRefreshing(false)
    }
  }

  // Initial load + polling
  useEffect(() => {
    fetchSessions()
    const interval = setInterval(() => fetchSessions(), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [soundEnabled])

  const handleRefresh = () => fetchSessions(true)

  const handleTerminate = (sessionId: string) => {
    setSessionToTerminate(sessionId)
    setShowTerminateDialog(true)
  }

  const confirmTerminate = async () => {
    if (!sessionToTerminate) return
    try {
      await fetch(`/api/sessions/${sessionToTerminate}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "terminated", score: 0, totalPoints: 0, earnedPoints: 0, passed: false }),
      })
      await fetchSessions()
    } catch (err) {
      console.error("Failed to terminate session", err)
    } finally {
      setShowTerminateDialog(false)
      setSessionToTerminate(null)
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || session.status === statusFilter
    const matchesViolation =
      violationFilter === "all" ||
      (violationFilter === "with_violations" && session.violations.length > 0) ||
      (violationFilter === "no_violations" && session.violations.length === 0)
    return matchesSearch && matchesStatus && matchesViolation
  })

  const stats = {
    total: sessions.length,
    inProgress: sessions.filter((s) => s.status === "in_progress").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    terminated: sessions.filter((s) => s.status === "terminated").length,
    withViolations: sessions.filter((s) => s.violations.length > 0).length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Monitoring</h1>
          <p className="text-muted-foreground mt-1">Live data · refreshes every 10s</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? (
              <><Volume2 className="h-4 w-4 mr-1" />Sound On</>
            ) : (
              <><VolumeX className="h-4 w-4 mr-1" />Sound Off</>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
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

      {/* Violation Alert Banner */}
      {showViolationAlert && latestViolation && (
        <div className="bg-red-500 text-white py-3 px-4 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="font-medium">
                VIOLATION DETECTED: {latestViolation.session.employeeName} (
                {latestViolation.session.employeeId}) — {latestViolation.violation.description}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600 shrink-0"
              onClick={() => setShowViolationAlert(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-700">{stats.inProgress}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-700">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Terminated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-700">{stats.terminated}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">With Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold text-amber-700">{stats.withViolations}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          <SessionCard key={session.id} session={session} onTerminate={handleTerminate} />
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No sessions match your filters</p>
        </div>
      )}

      {/* Terminate Confirmation Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Exam Session?</DialogTitle>
            <DialogDescription>
              This will immediately end the exam for this employee. Their current progress will be
              marked as terminated with a score of 0. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmTerminate}>Terminate Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
