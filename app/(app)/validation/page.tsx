"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Send, PlusCircle, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRequest {
  id: number
  skillId: number
  skillName: string
  skillCode: string
  supervisorName: string
  status: string
  requestDate: string
  decisionDate: string | null
  employeeNotes: string
  supervisorNotes: string
}

interface SkillProgress {
  skillId: number
  skillName: string
  skillCode: string
  programName: string
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved — Ready for Exam",
  rejected: "Rejected",
  revision_required: "Revision Required",
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision_required: "bg-blue-100 text-blue-800",
}

export default function ValidationPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ValidationRequest[]>([])
  const [availableSkills, setAvailableSkills] = useState<SkillProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (!user?.id) return
    fetchData()
  }, [user])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [reqRes, skillRes] = await Promise.all([
        fetch(`/api/validation-requests?employeeId=${user!.id}`),
        fetch(`/api/skill-progress?employeeId=${user!.id}`),
      ])
      const [reqData, skillData] = await Promise.all([reqRes.json(), skillRes.json()])
      setRequests(Array.isArray(reqData) ? reqData : [])
      // Only show skills that can be re-requested
      setAvailableSkills(
        (Array.isArray(skillData) ? skillData : []).filter((s: SkillProgress) =>
          ["not_started", "not_competent", "on_progress"].includes(s.status)
        )
      )
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedSkillId || !user?.id) return
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/validation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: user.id, skillId: parseInt(selectedSkillId), notes }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error ?? "Failed to submit request"); return }
      setShowDialog(false)
      setSelectedSkillId("")
      setNotes("")
      fetchData()
    } catch {
      setSubmitError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Validation Requests</h1>
          <p className="text-muted-foreground mt-1">Submit skill validation requests to your supervisor.</p>
        </div>
        <Button onClick={() => { setSubmitError(""); setShowDialog(true) }} disabled={availableSkills.length === 0}>
          <PlusCircle className="h-4 w-4 mr-2" />New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Send className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground">No validation requests yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Click &quot;New Request&quot; to begin the validation process.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{req.skillName}</p>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">{req.skillCode}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Supervisor: <span className="font-medium text-foreground">{req.supervisorName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested: {new Date(req.requestDate).toLocaleDateString()}
                      {req.decisionDate && ` · Decision: ${new Date(req.decisionDate).toLocaleDateString()}`}
                    </p>
                    {req.employeeNotes && <p className="text-xs text-muted-foreground mt-1 italic">Your note: {req.employeeNotes}</p>}
                    {req.supervisorNotes && <p className="text-xs text-blue-700 mt-1 italic">Supervisor: {req.supervisorNotes}</p>}
                  </div>
                  <Badge className={cn("shrink-0", STATUS_COLOR[req.status])}>
                    {STATUS_LABEL[req.status]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Validation Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Skill</Label>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger><SelectValue placeholder="Choose a skill..." /></SelectTrigger>
                <SelectContent>
                  {availableSkills.map((s) => (
                    <SelectItem key={s.skillId} value={String(s.skillId)}>
                      {s.skillName} — {s.programName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea placeholder="Add context for your supervisor..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!selectedSkillId || isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />Submit</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
