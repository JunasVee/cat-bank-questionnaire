"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Loader2, BookOpen, CheckCircle2, Clock, Map,
  ChevronRight, AlertCircle, PlayCircle, Lock, Flag,
} from "lucide-react"
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

interface JourneySkill {
  skillId: number
  skillName: string
  skillCode: string
  status: string
}

interface JourneyStage {
  stageId: number
  stageName: string
  skills: JourneySkill[]
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

/* ─── Journey helpers ────────────────────────────────────────── */
type StageState = "complete" | "active" | "locked" | "empty"

function getStageState(stage: JourneyStage): StageState {
  if (stage.skills.length === 0) return "empty"
  const competent = stage.skills.filter((s) => s.status === "competent").length
  if (competent === stage.skills.length) return "complete"
  if (stage.skills.some((s) => s.status !== "not_started")) return "active"
  return "locked"
}

/* ─── Stage Card ─────────────────────────────────────────────── */
function StageCard({ stage }: { stage: JourneyStage }) {
  const state = getStageState(stage)
  const competent = stage.skills.filter((s) => s.status === "competent").length
  const total = stage.skills.length
  const isLocked = state === "locked" || state === "empty"
  const isComplete = state === "complete"

  if (isLocked) {
    return (
      <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-2.5 w-36">
        <div className="flex items-start gap-1.5">
          <Lock className="h-3 w-3 text-muted-foreground/50 mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-snug">
            {total > 0 ? `${competent}/${total} Skills Competent` : "Locked"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-white p-2.5 w-36 shadow-sm">
      <p className="text-[10px] text-amber-600 underline underline-offset-1 cursor-pointer leading-relaxed hover:text-amber-700">
        Display List Skill Code
      </p>
      <p className="text-[10px] text-amber-600 underline underline-offset-1 cursor-pointer leading-relaxed hover:text-amber-700">
        Display Training History
      </p>
      <div className="mt-2 border-t border-amber-100 pt-1.5">
        <p className="text-[11px] font-semibold text-foreground">
          {competent}/{total} Skills Competent
        </p>
        <p className={cn("text-[10px] mt-0.5 font-medium", isComplete ? "text-amber-500" : "text-amber-500")}>
          {isComplete ? "Completed" : "On Progress"}
        </p>
      </div>
    </div>
  )
}

/* ─── Stage Circle ───────────────────────────────────────────── */
function StageCircle({ state }: { state: StageState }) {
  if (state === "locked" || state === "empty") {
    return (
      <div className="h-8 w-8 rounded-full bg-muted border-2 border-muted-foreground/25 flex items-center justify-center shadow-sm shrink-0">
        <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>
    )
  }
  if (state === "complete") {
    return (
      <div className="h-8 w-8 rounded-full bg-amber-400 border-2 border-white shadow-md flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-4 w-4 text-white" />
      </div>
    )
  }
  // active
  return (
    <div className="h-8 w-8 rounded-full bg-amber-400 border-2 border-white shadow-md ring-2 ring-amber-200 shrink-0" />
  )
}

/* ─── Horizontal Timeline ────────────────────────────────────── */
function ProgramJourneyTimeline({ journey }: { journey: JourneyStage[] }) {
  if (journey.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-10 text-center">
        No program stages found. Ask your administrator to configure your program roadmap.
      </p>
    )
  }

  // Card height ~108px, connector ~20px, circle 32px, label ~40px
  // Top half: 180px, Circle: 32px, Bottom half: 180px → total 392px
  const TOTAL_H = 392
  const HALF_H = 180

  return (
    <div className="overflow-x-auto pb-2 pt-2">
      <div
        className="relative inline-flex items-stretch min-w-max px-2"
        style={{ height: `${TOTAL_H}px` }}
      >
        {/* Horizontal centre line — sits exactly at HALF_H + circle centre */}
        <div
          className="absolute left-20 right-2 bg-amber-300 z-0 rounded-full"
          style={{ top: `${HALF_H + 16}px`, height: "3px" }}
        />

        {/* ── START flag ── */}
        <div
          className="flex flex-col items-center justify-center w-20 shrink-0 z-10 gap-1"
          style={{ paddingTop: `${HALF_H - 16}px` }}
        >
          <Flag className="h-8 w-8 text-amber-500 fill-amber-400" />
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest">START</span>
        </div>

        {/* ── Stage columns ── */}
        {journey.map((stage, i) => {
          const state = getStageState(stage)
          const isAbove = i % 2 === 1 // odd index → card above the line

          return (
            <div
              key={stage.stageId}
              className="relative flex flex-col items-center w-44 shrink-0 z-10"
            >
              {/* TOP HALF */}
              <div
                className="flex flex-col justify-end items-center w-full pb-0"
                style={{ height: `${HALF_H}px` }}
              >
                {isAbove ? (
                  <>
                    <StageCard stage={stage} />
                    {/* Connector from card to circle */}
                    <div className="w-px flex-1 bg-border/60 mt-1" />
                  </>
                ) : null}
              </div>

              {/* CIRCLE — always at the line */}
              <div className="shrink-0 z-10">
                <StageCircle state={state} />
              </div>

              {/* BOTTOM HALF */}
              <div
                className="flex flex-col justify-start items-center w-full pt-0"
                style={{ height: `${HALF_H}px` }}
              >
                {/* Stage label always at top of bottom half */}
                <div className="w-px h-3 bg-border/60 mt-1" />
                <div className="text-center px-1 mb-1">
                  <p className="text-[9px] text-muted-foreground/60 leading-none mb-0.5">
                    Stage {i + 1}
                  </p>
                  <p className="text-[10px] font-semibold text-foreground/80 leading-tight">
                    {stage.stageName}
                  </p>
                </div>

                {!isAbove ? (
                  <>
                    {/* Connector from label to card */}
                    <div className="w-px h-3 bg-border/60" />
                    <StageCard stage={stage} />
                  </>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<SkillProgress[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [journey, setJourney] = useState<JourneyStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("All")
  const [showJourney, setShowJourney] = useState(false)
  const [isJourneyLoading, setIsJourneyLoading] = useState(false)

  const competentCount = skills.filter((s) => s.status === "competent").length
  const totalSkills = skills.length
  const notCompetentCount = skills.filter((s) => s.status !== "competent").length

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      fetch(`/api/skill-progress?employeeId=${user.id}`).then((r) => r.json()),
      fetch(`/api/tasks?employeeId=${user.id}`).then((r) => r.json()),
    ])
      .then(([skillData, taskData]) => {
        setSkills(Array.isArray(skillData) ? skillData : [])
        setTasks(Array.isArray(taskData) ? taskData : [])
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user])

  const loadJourney = async () => {
    if (!user?.id || !user?.programId) {
      setShowJourney(true)
      return
    }
    setIsJourneyLoading(true)
    setShowJourney(true)
    try {
      const res = await fetch(`/api/program-journey?employeeId=${user.id}&programId=${user.programId}`)
      if (res.ok) setJourney(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setIsJourneyLoading(false)
    }
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

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?"

  return (
    <div className="space-y-6">
      {/* ── Employee Quick Profile ────────────────────────────── */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user?.name}</h2>
              <p className="text-muted-foreground text-sm">{user?.role}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">ID:</span> {user?.id}
                </span>
              </div>
            </div>
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

      {/* ── My Active Tasks ──────────────────────────────────── */}
      {activeTasks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-base text-amber-800">My Active Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 bg-white rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.skillName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.supervisorName} · {new Date(t.requestDate).toLocaleDateString()}
                  </p>
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
                <Link href="/validation">
                  View all validation requests <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Main Tabs ────────────────────────────────────────── */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="service-orders">Service Order List</TabsTrigger>
          <TabsTrigger value="prerequisite">Prerequisite</TabsTrigger>
          <TabsTrigger value="training-history">Training History</TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Program Development Journey card */}
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
                    <p className="text-sm text-muted-foreground">
                      View your full skill roadmap and progress
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              {totalSkills > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Overall completion</span>
                    <span>
                      {competentCount}/{totalSkills} skills competent
                    </span>
                  </div>
                  <Progress
                    value={Math.round((competentCount / totalSkills) * 100)}
                    className="h-2"
                  />
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
                  <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                  Request Validation
                </Link>
              </Button>
            </div>

            {/* Filter pills */}
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
                    (
                    {f === "All"
                      ? totalSkills
                      : skills.filter((s) => matchesFilter(s.status, f)).length}
                    )
                  </span>
                </button>
              ))}
            </div>

            {filteredSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No skills match this filter.
              </p>
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
                        <p className="font-semibold text-sm leading-tight truncate">
                          {skill.skillName}
                        </p>
                        <p className="text-xs opacity-70 font-mono mt-0.5">{skill.skillCode}</p>
                      </div>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0 mt-1",
                          STATUS_DOT[skill.status]
                        )}
                      />
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 h-7 text-xs"
                        asChild
                      >
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

      {/* ── Program Journey Dialog (horizontal timeline) ──────── */}
      <Dialog open={showJourney} onOpenChange={setShowJourney}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Map className="h-5 w-5 text-primary" />
              Program Development Journey
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-6 py-6">
            {isJourneyLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ProgramJourneyTimeline journey={journey} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
