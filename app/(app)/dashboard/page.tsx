"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, User, BookOpen, CheckCircle2, XCircle, Clock, Map, ChevronRight, AlertCircle, PlayCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────────────── */
interface SkillProgress {
  skillId: number
  skillCode: string
  skillName: string
  description: string
  programName: string
  status: "not_started" | "on_progress" | "requesting_validation" | "approved" | "competent" | "not_competent"
  lastScore: number | null
  lastPassed: boolean | null
}

interface Task {
  id: number
  skillName: string
  skillCode: string
  supervisorName: string
  status: "pending" | "approved" | "rejected" | "revision_required"
  requestDate: string
  decisionDate: string | null
  supervisorNotes: string
}

interface JourneyStage {
  stageId: number
  stageName: string
  skills: { skillId: number; skillName: string; skillCode: string; status: string }[]
}

/* ─── Status helpers ─────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  not_started: "Not Started",
  on_progress: "On Progress",
  requesting_validation: "Awaiting Validation",
  approved: "Approved",
  competent: "Competent",
  not_competent: "Not Yet Competent",
}

const STATUS_COLOR: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground border-border",
  on_progress: "bg-blue-50 text-blue-700 border-blue-200",
  requesting_validation: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-purple-50 text-purple-700 border-purple-200",
  competent: "bg-green-50 text-green-700 border-green-200",
  not_competent: "bg-red-50 text-red-700 border-red-200",
}

const STATUS_DOT: Record<string, string> = {
  not_started: "bg-muted-foreground",
  on_progress: "bg-blue-500",
  requesting_validation: "bg-amber-500",
  approved: "bg-purple-500",
  competent: "bg-green-500",
  not_competent: "bg-red-500",
}

const TASK_STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision_required: "bg-blue-100 text-blue-800",
}

const TASK_STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved — Ready for Exam",
  rejected: "Rejected",
  revision_required: "Revision Required",
}

const SKILL_FILTERS = ["All", "Competent", "Not Yet Competent", "On Progress", "Not Started"] as const
type SkillFilter = typeof SKILL_FILTERS[number]

function matchesFilter(status: string, filter: SkillFilter) {
  if (filter === "All") return true
  if (filter === "Competent") return status === "competent"
  if (filter === "Not Yet Competent") return status === "not_competent"
  if (filter === "On Progress") return ["on_progress", "requesting_validation", "approved"].includes(status)
  if (filter === "Not Started") return status === "not_started"
  return true
}

/* ─── Component ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<SkillProgress[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [journey, setJourney] = useState<JourneyStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("All")
  const [showJourney, setShowJourney] = useState(false)

  const yearsInPosition = user ? (() => {
    // placeholder — we'd use position_start_date if available
    return "—"
  })() : "—"

  const competentCount = skills.filter((s) => s.status === "competent").length
  const totalSkills = skills.length
  const notCompetentCount = skills.filter((s) => s.status !== "competent").length

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      fetch(`/api/skill-progress?employeeId=${user.id}`).then((r) => r.json()),
      fetch(`/api/tasks?employeeId=${user.id}`).then((r) => r.json()),
    ]).then(([skillData, taskData]) => {
      setSkills(Array.isArray(skillData) ? skillData : [])
      setTasks(Array.isArray(taskData) ? taskData : [])
    }).catch(console.error).finally(() => setIsLoading(false))
  }, [user])

  const loadJourney = async () => {
    if (!user?.id || !user?.programId) return
    const res = await fetch(`/api/program-journey?employeeId=${user.id}&programId=${user.programId}`)
    if (res.ok) setJourney(await res.json())
    setShowJourney(true)
  }

  const filteredSkills = skills.filter((s) => matchesFilter(s.status, skillFilter))
  const activeTasks = tasks.filter((t) => ["pending", "revision_required"].includes(t.status))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const initials = user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?"

  return (
    <div className="space-y-6">
      {/* ── Employee Quick Profile ────────────────────────────── */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user?.name}</h2>
              <p className="text-muted-foreground text-sm">{user?.role}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span><span className="font-medium text-foreground">ID:</span> {user?.id}</span>
                <span><span className="font-medium text-foreground">Years in Position:</span> {yearsInPosition}</span>
              </div>
            </div>
            {/* Skill summary */}
            <div className="flex gap-4 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{competentCount}</p>
                <p className="text-xs text-muted-foreground">Skills Competent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{notCompetentCount}</p>
                <p className="text-xs text-muted-foreground">Not Yet Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── My Task ─────────────────────────────────────────────── */}
      {activeTasks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-base text-amber-800">My Active Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 bg-white rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.skillName}</p>
                  <p className="text-xs text-muted-foreground">{t.supervisorName} · {new Date(t.requestDate).toLocaleDateString()}</p>
                  {t.supervisorNotes && t.status === "revision_required" && (
                    <p className="text-xs text-blue-700 mt-1 italic">Note: {t.supervisorNotes}</p>
                  )}
                </div>
                <Badge className={cn("text-xs shrink-0", TASK_STATUS_COLOR[t.status])}>
                  {TASK_STATUS_LABEL[t.status]}
                </Badge>
              </div>
            ))}
            <div className="pt-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/validation">View all validation requests <ChevronRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Main tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="service-orders">Service Order List</TabsTrigger>
          <TabsTrigger value="prerequisite">Prerequisite</TabsTrigger>
          <TabsTrigger value="training-history">Training History</TabsTrigger>
        </TabsList>

        {/* ── Overview tab ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Program Development Journey */}
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors group"
            onClick={loadJourney}
          >
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Map className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Program Development Journey</p>
                    <p className="text-sm text-muted-foreground">View your full skill roadmap and progress</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              {/* Mini progress bar */}
              {totalSkills > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Overall completion</span>
                    <span>{competentCount}/{totalSkills} skills competent</span>
                  </div>
                  <Progress value={Math.round((competentCount / totalSkills) * 100)} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Competency */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Skill Competency
              </h3>
              <Button variant="outline" size="sm" asChild>
                <Link href="/validation">
                  <PlayCircle className="h-3.5 w-3.5 mr-1.5" />Request Validation
                </Link>
              </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 flex-wrap mb-4">
              {SKILL_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSkillFilter(f)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    skillFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {f}
                  <span className="ml-1 opacity-70">
                    ({f === "All"
                      ? totalSkills
                      : skills.filter((s) => matchesFilter(s.status, f)).length})
                  </span>
                </button>
              ))}
            </div>

            {filteredSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No skills match this filter.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.skillId}
                    className={cn(
                      "rounded-lg border p-4 transition-shadow hover:shadow-sm",
                      STATUS_COLOR[skill.status]
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{skill.skillName}</p>
                        <p className="text-xs opacity-70 font-mono mt-0.5">{skill.skillCode}</p>
                      </div>
                      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-1", STATUS_DOT[skill.status])} />
                    </div>
                    <p className="text-xs opacity-70 mb-2 line-clamp-2">{skill.programName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{STATUS_LABEL[skill.status]}</span>
                      {skill.lastScore !== null && (
                        <span className="text-xs opacity-70">Last: {skill.lastScore}%</span>
                      )}
                    </div>
                    {skill.status === "approved" && (
                      <Button size="sm" className="w-full mt-3 h-7 text-xs" asChild>
                        <Link href="/assessment">Take Exam</Link>
                      </Button>
                    )}
                    {(skill.status === "not_started" || skill.status === "not_competent") && (
                      <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs" asChild>
                        <Link href="/validation">Request Validation</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stub tabs */}
        {["schedule", "service-orders", "prerequisite", "training-history"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Coming Soon</p>
                <p className="text-sm mt-1">This section is under development.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Program Journey Modal ────────────────────────────── */}
      <Dialog open={showJourney} onOpenChange={setShowJourney}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Program Development Journey
            </DialogTitle>
          </DialogHeader>

          {journey.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No program stages found. Please ask your administrator to configure your program roadmap.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 mt-2">
              {/* Vertical line */}
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

              {journey.map((stage, i) => {
                const competent = stage.skills.filter((s) => s.status === "competent").length
                const total = stage.skills.length
                const allDone = total > 0 && competent === total
                return (
                  <div key={stage.stageId} className="relative">
                    {/* Stage dot */}
                    <div className={cn(
                      "absolute -left-4 top-1 h-4 w-4 rounded-full border-2 border-background",
                      allDone ? "bg-green-500" : i === 0 ? "bg-primary" : "bg-muted-foreground/40"
                    )} />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{stage.stageName}</h4>
                        {total > 0 && (
                          <span className="text-xs text-muted-foreground">{competent}/{total} completed</span>
                        )}
                      </div>

                      {stage.skills.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No skills at this stage</p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {stage.skills.map((skill) => (
                            <div
                              key={skill.skillId}
                              className={cn(
                                "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                                STATUS_COLOR[skill.status]
                              )}
                            >
                              <div className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[skill.status])} />
                              <span className="font-medium truncate">{skill.skillName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
