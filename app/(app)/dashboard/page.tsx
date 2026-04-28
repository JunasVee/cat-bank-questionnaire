"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, TrendingUp, CheckCircle2, XCircle, BarChart2, BookOpen, ClipboardList } from "lucide-react"

interface DashboardStats {
  totalAssessments: number
  passedAssessments: number
  failedAssessments: number
  avgScore: number
  totalSkills: number
  completedSkills: number
  completionRate: number
}

interface ProgramStat {
  programName: string
  totalSkills: number
  completedSkills: number
  avgScore: number
  completionRate: number
}

interface RecentAssessment {
  id: number
  skillName: string
  skillCode: string
  status: string
  score: number | null
  passed: boolean | null
  startTime: string | null
  endTime: string | null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [byProgram, setByProgram] = useState<ProgramStat[]>([])
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchDashboard()
  }, [user])

  async function fetchDashboard() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/dashboard/overview?employeeId=${user!.id}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setByProgram(data.byProgram)
        setRecentAssessments(data.recentAssessments)
      }
    } catch (err) {
      console.error("Failed to load dashboard", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your skill completion overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completionRate ?? 0}%</div>
            <Progress value={stats?.completionRate ?? 0} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.completedSkills ?? 0} / {stats?.totalSkills ?? 0} skills completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.avgScore ?? 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {stats?.totalAssessments ?? 0} assessment{stats?.totalAssessments !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.passedAssessments ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Assessments passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats?.failedAssessments ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Assessments failed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill completion by program */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Skill Completion by Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byProgram.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No skill data available.</p>
            ) : (
              byProgram.map((prog) => (
                <div key={prog.programName}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate max-w-[60%]">{prog.programName}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{prog.completedSkills}/{prog.totalSkills}</span>
                      <span className="font-semibold text-foreground">{prog.completionRate}%</span>
                    </div>
                  </div>
                  <Progress value={prog.completionRate} className="h-2" />
                  {prog.avgScore > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">Avg score: {prog.avgScore}%</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent assessments */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAssessments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No assessments yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Go to <span className="font-medium">Assessment → Start Assessment</span> to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.skillName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.skillCode}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {a.score !== null && (
                        <span className="text-sm font-semibold">{a.score}%</span>
                      )}
                      {a.passed === true && (
                        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                          Passed
                        </Badge>
                      )}
                      {a.passed === false && (
                        <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50 text-xs">
                          Failed
                        </Badge>
                      )}
                      {a.passed === null && (
                        <Badge variant="secondary" className="text-xs">
                          {a.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
