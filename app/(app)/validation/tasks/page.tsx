"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Loader2, ClipboardList, CheckCircle2, XCircle, RotateCcw, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRequest {
  id: number
  employeeId: number
  employeeName: string
  employeeJobTitle: string
  skillId: number
  skillName: string
  skillCode: string
  skillDescription: string
  programName: string
  status: string
  requestDate: string
  decisionDate: string | null
  employeeNotes: string
  supervisorNotes: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision_required: "bg-blue-100 text-blue-800",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  revision_required: "Revision Required",
}

export default function ValidationTasksPage() {
  const { user } = useAuth()
  const isManager = user?.role?.toLowerCase() === "manager" || user?.role?.toLowerCase() === "administrator" || user?.role?.toLowerCase() === "admin"

  const [requests, setRequests] = useState<ValidationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null)
  const [decisionStatus, setDecisionStatus] = useState<"approved" | "rejected" | "revision_required" | null>(null)
  const [supervisorNotes, setSupervisorNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetchRequests()
  }, [user])

  async function fetchRequests() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/validation-requests?supervisorId=${user!.id}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  function openDecision(req: ValidationRequest, decision: "approved" | "rejected" | "revision_required") {
    setSelectedRequest(req)
    setDecisionStatus(decision)
    setSupervisorNotes("")
  }

  async function submitDecision() {
    if (!selectedRequest || !decisionStatus) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/validation-requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decisionStatus, supervisorNotes }),
      })
      if (res.ok) {
        setSelectedRequest(null)
        setDecisionStatus(null)
        fetchRequests()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          This page is only available to managers and supervisors. Contact your administrator if you believe this is an error.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  const pending = requests.filter((r) => r.status === "pending")
  const others = requests.filter((r) => r.status !== "pending")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Validation Task</h1>
        <p className="text-muted-foreground mt-1">
          Review and decide on your team&apos;s skill validation requests.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground">No validation requests yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Requests from your team members will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pending Review ({pending.length})
              </h2>
              {pending.map((req) => (
                <RequestCard key={req.id} req={req} onDecide={openDecision} showActions />
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Past Decisions ({others.length})
              </h2>
              {others.map((req) => (
                <RequestCard key={req.id} req={req} onDecide={openDecision} showActions={false} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Decision Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setDecisionStatus(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decisionStatus === "approved" && "✅ Approve Validation Request"}
              {decisionStatus === "rejected" && "❌ Reject Validation Request"}
              {decisionStatus === "revision_required" && "🔄 Request Revision"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  <strong>{selectedRequest.employeeName}</strong> — {selectedRequest.skillName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {decisionStatus === "approved" && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
              Approving this request will allow the employee to take the related assessment exam.
            </p>
          )}
          {decisionStatus === "rejected" && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              Rejecting this request will mark the skill as not competent. The employee may request again later.
            </p>
          )}
          {decisionStatus === "revision_required" && (
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
              The employee will be asked to review and resubmit their request.
            </p>
          )}

          <div className="space-y-2 mt-2">
            <Label>Notes <span className="text-muted-foreground text-xs">(optional but recommended)</span></Label>
            <Textarea
              placeholder="Provide feedback for the employee..."
              value={supervisorNotes}
              onChange={(e) => setSupervisorNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedRequest(null); setDecisionStatus(null) }}>Cancel</Button>
            <Button
              onClick={submitDecision}
              disabled={isSubmitting}
              variant={decisionStatus === "rejected" ? "destructive" : "default"}
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RequestCard({
  req,
  onDecide,
  showActions,
}: {
  req: ValidationRequest
  onDecide: (req: ValidationRequest, decision: "approved" | "rejected" | "revision_required") => void
  showActions: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="font-semibold truncate">{req.skillName}
              <span className="text-xs text-muted-foreground font-mono font-normal ml-2">{req.skillCode}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {req.employeeName}
              {req.employeeJobTitle && <span className="text-xs"> · {req.employeeJobTitle}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{req.programName} · {new Date(req.requestDate).toLocaleDateString()}</p>
            {req.employeeNotes && (
              <p className="text-xs text-muted-foreground mt-1 italic">Employee note: {req.employeeNotes}</p>
            )}
            {req.supervisorNotes && (
              <p className="text-xs text-blue-700 mt-1 italic">Your note: {req.supervisorNotes}</p>
            )}
          </div>
          <Badge className={cn("shrink-0", STATUS_COLOR[req.status])}>
            {STATUS_LABEL[req.status]}
          </Badge>
        </div>

        {showActions && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => onDecide(req, "approved")}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Approve
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => onDecide(req, "revision_required")}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Request Revision
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-red-300 text-red-700 hover:bg-red-50" onClick={() => onDecide(req, "rejected")}>
              <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
