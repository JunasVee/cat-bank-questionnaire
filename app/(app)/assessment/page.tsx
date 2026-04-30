"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
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
import { useTabVisibility, TabViolation } from "@/hooks/use-tab-visibility"
import { useExamTimer } from "@/hooks/use-exam-timer"
import { ExamHeader } from "@/components/exam/exam-header"
import { ExamQuestionCard } from "@/components/exam/exam-question-card"
import { ViolationWarning } from "@/components/exam/violation-warning"
import { QuestionnaireForm } from "@/lib/types"

const MAX_VIOLATIONS = 3

type ExamStep = "select" | "exam" | "result"

interface ExamAnswers {
  [questionId: string]: string | string[]
}

export default function AssessmentPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<ExamStep>("select")
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<QuestionnaireForm[]>([])
  const [form, setForm] = useState<QuestionnaireForm | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<ExamAnswers>({})
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const [latestViolation, setLatestViolation] = useState<TabViolation | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    score: number
    passed: boolean
    totalPoints: number
    earnedPoints: number
  } | null>(null)

  const examStarted = step === "exam"
  const examSubmitted = step === "result"

  useEffect(() => {
    if (!user?.id) return
    setIsLoadingList(true)
    // Only show questionnaires where the employee has an approved validation request
    fetch(`/api/skill-progress?employeeId=${user.id}`)
      .then((r) => r.json())
      .then(async (skills: any[]) => {
        const approvedSkillIds = new Set(
          (Array.isArray(skills) ? skills : [])
            .filter((s) => s.status === "approved")
            .map((s) => s.skillId)
        )
        if (approvedSkillIds.size === 0) { setAvailableQuestionnaires([]); return }
        const res = await fetch(`/api/questionnaires?active=true`)
        const all = await res.json()
        setAvailableQuestionnaires(
          (Array.isArray(all) ? all : []).filter((q: any) => approvedSkillIds.has(parseInt(q.id)))
        )
      })
      .catch(() => setAvailableQuestionnaires([]))
      .finally(() => setIsLoadingList(false))
  }, [user])

  const handleViolation = useCallback(
    async (violation: TabViolation) => {
      if (!examStarted || examSubmitted) return
      setLatestViolation(violation)
      setShowViolationWarning(true)
      if (sessionId) {
        try {
          await fetch(`/api/sessions/${sessionId}/violations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ violationType: violation.type, description: violation.description }),
          })
        } catch {}
      }
    },
    [examStarted, examSubmitted, sessionId]
  )

  const { violations: _violations, violationCount } = useTabVisibility(handleViolation)

  useEffect(() => {
    if (violationCount >= MAX_VIOLATIONS && examStarted && !examSubmitted) {
      handleSubmitExam()
    }
  }, [violationCount, examStarted, examSubmitted])

  const handleTimeExpired = useCallback(() => {
    if (examStarted && !examSubmitted) setShowTimeUpDialog(true)
  }, [examStarted, examSubmitted])

  const { formattedTime, timeRemaining, start: startTimer } = useExamTimer(
    form?.timeLimit ?? 60,
    handleTimeExpired
  )

  const handleSelectQuestionnaire = async (formCode: string) => {
    setIsLoadingForm(true)
    try {
      const res = await fetch(`/api/exam/${formCode}`)
      if (!res.ok) return
      const data = await res.json()
      setForm(data)

      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: user!.id, skillId: data.id }),
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
        if (correctChoice && userAnswer === correctChoice.id) earnedPoints += question.points
      } else if (question.type === "checkbox") {
        const correctIds = question.choices.filter((c) => c.isCorrect).map((c) => c.id).sort()
        const userIds = Array.isArray(userAnswer) ? [...userAnswer].sort() : []
        if (JSON.stringify(correctIds) === JSON.stringify(userIds)) earnedPoints += question.points
      } else if (question.type === "short-answer") {
        if (
          typeof userAnswer === "string" &&
          userAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase()
        ) earnedPoints += question.points
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

  // Step 1: Select questionnaire
  if (step === "select") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Start Assessment</h1>
          <p className="text-muted-foreground mt-1">
            Select an available assessment to begin.
          </p>
        </div>

        {isLoadingList ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : availableQuestionnaires.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="font-medium text-muted-foreground">No approved assessments available.</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Go to <strong>Skill Validation → My Validation Request</strong>, submit a request, and once your supervisor approves it the exam will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {availableQuestionnaires.map((q) => (
              <Card
                key={q.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => !isLoadingForm && handleSelectQuestionnaire(q.formCode)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{q.title}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{q.formCode}</p>
                      {q.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{q.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{(q as any).questionCount ?? q.questions.length} questions</span>
                        <span>Pass: {q.passingScore}%</span>
                        <span>{q.timeLimit} min</span>
                      </div>
                    </div>
                    <Button size="sm" disabled={isLoadingForm}>
                      {isLoadingForm ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Result screen
  if (step === "result" && submissionResult) {
    const totalQ = form?.questions.length ?? 0
    return (
      <div className="max-w-lg mx-auto">
        <Card>
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
                ? "You have passed the assessment."
                : "Unfortunately, you did not meet the passing score."}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <p className="text-6xl font-bold">{submissionResult.score}%</p>
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
                <p className="font-medium">{getAnsweredCount()} / {totalQ}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Tab Violations</p>
                <p className={`font-medium ${violationCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {violationCount}
                </p>
              </div>
            </div>
            <Button onClick={() => { setStep("select"); setAnswers({}); setForm(null); setSessionId(null) }} className="w-full">
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Exam screen
  const totalQuestions = form?.questions.length ?? 0
  const currentQuestion = form?.questions[currentQuestionIndex]
  if (!form || !currentQuestion) return null

  return (
    <div className="-m-6">
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

      <div className="max-w-3xl mx-auto px-4 py-6">
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
            <ChevronLeft className="h-4 w-4 mr-2" />Previous
          </Button>
          <Badge variant="secondary">{getAnsweredCount()} of {totalQuestions} answered</Badge>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex((p) => p + 1)}>
              Next<ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setShowSubmitConfirm(true)}>
              <Send className="h-4 w-4 mr-2" />Submit
            </Button>
          )}
        </div>
      </div>

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
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {getAnsweredCount()} of {totalQuestions} questions.
              {getAnsweredCount() < totalQuestions && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Warning: {totalQuestions - getAnsweredCount()} unanswered question(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTimeUpDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />Time&apos;s Up!
            </DialogTitle>
            <DialogDescription>Your exam time has expired. Answers will be submitted automatically.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSubmitExam} className="w-full">View Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
