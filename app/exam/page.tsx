"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTabVisibility, TabViolation } from "@/hooks/use-tab-visibility"
import { useExamTimer } from "@/hooks/use-exam-timer"
import { ExamHeader } from "@/components/exam/exam-header"
import { ExamQuestionCard } from "@/components/exam/exam-question-card"
import { ViolationWarning } from "@/components/exam/violation-warning"
import { QuestionnaireForm } from "@/lib/types"

const MAX_VIOLATIONS = 3

type ExamStep = "identify" | "select" | "exam" | "result"

interface ExamAnswers {
  [questionId: string]: string | string[]
}

interface EmployeeInfo {
  id: number
  name: string
  department: string
  programId: number
}

export default function ExamPage() {
  const router = useRouter()
  const [step, setStep] = useState<ExamStep>("identify")
  const [employeeIdInput, setEmployeeIdInput] = useState("")
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null)
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<QuestionnaireForm[]>([])
  const [form, setForm] = useState<QuestionnaireForm | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<ExamAnswers>({})
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const [latestViolation, setLatestViolation] = useState<TabViolation | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    score: number
    passed: boolean
    totalPoints: number
    earnedPoints: number
  } | null>(null)

  const examStarted = step === "exam"
  const examSubmitted = step === "result"

  // Tab visibility detection
  const handleViolation = useCallback(
    async (violation: TabViolation) => {
      if (!examStarted || examSubmitted) return
      setLatestViolation(violation)
      setShowViolationWarning(true)

      // Persist violation to DB
      if (sessionId) {
        try {
          await fetch(`/api/sessions/${sessionId}/violations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              violationType: violation.type,
              description: violation.description,
            }),
          })
        } catch {}
      }
    },
    [examStarted, examSubmitted, sessionId]
  )

  const { violations, violationCount } = useTabVisibility(handleViolation)

  useEffect(() => {
    if (violationCount >= MAX_VIOLATIONS && examStarted && !examSubmitted) {
      handleSubmitExam()
    }
  }, [violationCount, examStarted, examSubmitted])

  const handleTimeExpired = useCallback(() => {
    if (examStarted && !examSubmitted) {
      setShowTimeUpDialog(true)
    }
  }, [examStarted, examSubmitted])

  const { formattedTime, timeRemaining, start: startTimer } = useExamTimer(
    form?.timeLimit ?? 60,
    handleTimeExpired
  )

  const handleLookupEmployee = async () => {
    const id = parseInt(employeeIdInput.trim())
    if (isNaN(id)) {
      setLookupError("Please enter a valid numeric employee ID.")
      return
    }
    setIsLookingUp(true)
    setLookupError("")
    try {
      const res = await fetch(`/api/employees/${id}`)
      if (!res.ok) {
        setLookupError("Employee not found. Please check your ID.")
        return
      }
      const data = await res.json()
      setEmployeeInfo({ id: data.id, name: data.name, department: data.department, programId: data.programId })

      // Load questionnaires for this employee's program
      const qRes = await fetch(`/api/questionnaires?programId=${data.programId}&active=true`)
      const qData = await qRes.json()
      setAvailableQuestionnaires(qRes.ok ? qData : [])
      setStep("select")
    } catch {
      setLookupError("Network error. Please try again.")
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleSelectQuestionnaire = async (formCode: string) => {
    setIsLoadingForm(true)
    try {
      const res = await fetch(`/api/exam/${formCode}`)
      if (!res.ok) {
        return
      }
      const data = await res.json()
      setForm(data)

      // Start exam session in DB
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employeeInfo!.id, skillId: data.id }),
      })
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        setSessionId(sessionData.id)
      }

      setStep("exam")
      startTimer()
    } catch {
    } finally {
      setIsLoadingForm(false)
    }
  }

  const calculateScore = () => {
    if (!form) return { score: 0, passed: false, totalPoints: 0, earnedPoints: 0 }
    let earnedPoints = 0
    let totalPoints = 0

    form.questions.forEach((question) => {
      totalPoints += question.points
      const userAnswer = answers[question.id]

      if (question.type === "multiple-choice" || question.type === "true-false") {
        const correctChoice = question.choices.find((c) => c.isCorrect)
        if (correctChoice && userAnswer === correctChoice.id) {
          earnedPoints += question.points
        }
      } else if (question.type === "checkbox") {
        const correctIds = question.choices.filter((c) => c.isCorrect).map((c) => c.id).sort()
        const userIds = Array.isArray(userAnswer) ? [...userAnswer].sort() : []
        if (JSON.stringify(correctIds) === JSON.stringify(userIds)) {
          earnedPoints += question.points
        }
      } else if (question.type === "short-answer") {
        if (
          typeof userAnswer === "string" &&
          userAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase()
        ) {
          earnedPoints += question.points
        }
      }
    })

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    return { score, passed: score >= (form.passingScore ?? 70), totalPoints, earnedPoints }
  }

  const handleSubmitExam = async () => {
    if (!form) return
    const result = calculateScore()
    setSubmissionResult(result)
    setShowSubmitConfirm(false)
    setShowTimeUpDialog(false)

    // Persist session result to DB
    if (sessionId) {
      try {
        await fetch(`/api/sessions/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: violationCount >= MAX_VIOLATIONS ? "terminated" : "completed",
            score: result.score,
            totalPoints: result.totalPoints,
            earnedPoints: result.earnedPoints,
            passed: result.passed,
            answers,
          }),
        })
      } catch {}
    }

    setStep("result")
  }

  const getAnsweredCount = () =>
    Object.keys(answers).filter((key) => {
      const a = answers[key]
      return Array.isArray(a) ? a.length > 0 : a && String(a).trim() !== ""
    }).length

  const isQuestionAnswered = (questionId: string) => {
    const a = answers[questionId]
    return Array.isArray(a) ? a.length > 0 : a && String(a).trim() !== ""
  }

  // Step 1: Employee ID entry
  if (step === "identify") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-primary-foreground text-2xl">CAT</span>
            </div>
            <CardTitle className="text-2xl">Employee Exam Portal</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your employee ID to access available exams
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {lookupError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {lookupError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="number"
                placeholder="Enter your numeric employee ID"
                value={employeeIdInput}
                onChange={(e) => setEmployeeIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookupEmployee()}
                disabled={isLookingUp}
              />
            </div>
            <Button
              onClick={handleLookupEmployee}
              disabled={!employeeIdInput.trim() || isLookingUp}
              className="w-full"
              size="lg"
            >
              {isLookingUp ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Looking up...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Select questionnaire
  if (step === "select") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-primary-foreground text-2xl">CAT</span>
            </div>
            <CardTitle className="text-xl">Welcome, {employeeInfo?.name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">{employeeInfo?.department}</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-medium text-foreground">Available Exams</p>
            {isLoadingForm && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!isLoadingForm && availableQuestionnaires.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No exams available for your program at this time.
              </div>
            )}
            {!isLoadingForm &&
              availableQuestionnaires.map((q) => (
                <div
                  key={q.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectQuestionnaire(q.formCode)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{q.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{q.formCode}</p>
                      {q.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{q.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {q.timeLimit} min
                    </Badge>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{(q as any).questionCount ?? q.questions.length} questions</span>
                    <span>Pass: {q.passingScore}%</span>
                  </div>
                </div>
              ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setStep("identify")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = form?.questions.length ?? 0
  const currentQuestion = form?.questions[currentQuestionIndex]

  // Step 4: Results
  if (step === "result" && submissionResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center border-b">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                submissionResult.passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {submissionResult.passed ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <AlertTriangle className="h-10 w-10" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {submissionResult.passed ? "Congratulations!" : "Exam Completed"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {submissionResult.passed
                ? "You have passed the exam."
                : "Unfortunately, you did not meet the passing score."}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <p className="text-6xl font-bold text-foreground">{submissionResult.score}%</p>
              <p className="text-muted-foreground mt-2">
                {submissionResult.earnedPoints} / {submissionResult.totalPoints} points
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Passing Score</p>
                <p className="font-medium">{form?.passingScore}%</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Your Score</p>
                <p className={`font-medium ${submissionResult.passed ? "text-green-600" : "text-red-600"}`}>
                  {submissionResult.score}%
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Questions Answered</p>
                <p className="font-medium">{getAnsweredCount()} / {totalQuestions}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Tab Violations</p>
                <p className={`font-medium ${violationCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {violationCount}
                </p>
              </div>
            </div>

            {violationCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">
                      {violationCount} violation{violationCount !== 1 ? "s" : ""} recorded
                    </p>
                    <p className="text-red-700 mt-1">
                      Your exam administrator has been notified and may review your results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>Employee: {employeeInfo?.name}</p>
              <p>ID: {employeeInfo?.id}</p>
              <p className="mt-2">
                Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>

            <Button onClick={() => setStep("identify")} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Exam
  if (!form || !currentQuestion) return null

  return (
    <div className="min-h-screen bg-background">
      <ExamHeader
        title={form.title}
        formCode={form.formCode}
        formattedTime={formattedTime}
        timeRemaining={timeRemaining}
        violationCount={violationCount}
        maxViolations={MAX_VIOLATIONS}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {form.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-primary text-primary-foreground"
                  : isQuestionAnswered(q.id)
                  ? "bg-green-100 text-green-700 border-2 border-green-300"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <ExamQuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          answer={answers[currentQuestion.id] || (currentQuestion.type === "checkbox" ? [] : "")}
          onAnswerChange={(qId, ans) => setAnswers((prev) => ({ ...prev, [qId]: ans }))}
        />

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setCurrentQuestionIndex((p) => p - 1)} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Badge variant="secondary">{getAnsweredCount()} of {totalQuestions} answered</Badge>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex((p) => p + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setShowSubmitConfirm(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          )}
        </div>
      </main>

      <ViolationWarning
        open={showViolationWarning}
        onClose={() => setShowViolationWarning(false)}
        violation={latestViolation}
        violationCount={violationCount}
        maxViolations={MAX_VIOLATIONS}
      />

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {getAnsweredCount()} of {totalQuestions} questions.
              {getAnsweredCount() < totalQuestions && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Warning: You have {totalQuestions - getAnsweredCount()} unanswered question{totalQuestions - getAnsweredCount() !== 1 ? "s" : ""}.
                </span>
              )}
              <span className="block mt-2">Once submitted, you cannot modify your answers.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam}>Submit Exam</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTimeUpDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Time&apos;s Up!
            </DialogTitle>
            <DialogDescription>
              Your exam time has expired. Your answers will be submitted automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSubmitExam} className="w-full">
              View Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
