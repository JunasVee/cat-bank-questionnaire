"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
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
import { mockQuestionnaire } from "@/lib/mock-data"
import { useTabVisibility, TabViolation } from "@/hooks/use-tab-visibility"
import { useExamTimer } from "@/hooks/use-exam-timer"
import { ExamHeader } from "@/components/exam/exam-header"
import { ExamQuestionCard } from "@/components/exam/exam-question-card"
import { ViolationWarning } from "@/components/exam/violation-warning"

const MAX_VIOLATIONS = 3

interface ExamAnswers {
  [questionId: string]: string | string[]
}

export default function ExamPage() {
  const router = useRouter()
  const [examStarted, setExamStarted] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<ExamAnswers>({})
  const [employeeId, setEmployeeId] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const [latestViolation, setLatestViolation] = useState<TabViolation | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    score: number
    passed: boolean
    totalPoints: number
    earnedPoints: number
  } | null>(null)

  const form = mockQuestionnaire
  const totalQuestions = form.questions.length

  // Tab visibility detection
  const handleViolation = useCallback((violation: TabViolation) => {
    if (examStarted && !examSubmitted) {
      setLatestViolation(violation)
      setShowViolationWarning(true)
    }
  }, [examStarted, examSubmitted])

  const { violations, violationCount } = useTabVisibility(handleViolation)

  // Auto-submit when max violations reached
  useEffect(() => {
    if (violationCount >= MAX_VIOLATIONS && examStarted && !examSubmitted) {
      handleSubmitExam()
    }
  }, [violationCount, examStarted, examSubmitted])

  // Exam timer
  const handleTimeExpired = useCallback(() => {
    if (examStarted && !examSubmitted) {
      setShowTimeUpDialog(true)
    }
  }, [examStarted, examSubmitted])

  const { formattedTime, timeRemaining, start: startTimer, isExpired } = useExamTimer(
    form.timeLimit,
    handleTimeExpired
  )

  const currentQuestion = form.questions[currentQuestionIndex]

  const handleStartExam = () => {
    if (!employeeId.trim() || !employeeName.trim()) {
      return
    }
    setExamStarted(true)
    startTimer()
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const calculateScore = () => {
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
        const correctIds = question.choices
          .filter((c) => c.isCorrect)
          .map((c) => c.id)
          .sort()
        const userIds = Array.isArray(userAnswer)
          ? [...userAnswer].sort()
          : []
        if (JSON.stringify(correctIds) === JSON.stringify(userIds)) {
          earnedPoints += question.points
        }
      } else if (question.type === "short-answer") {
        // Simple exact match for demo
        if (
          typeof userAnswer === "string" &&
          userAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase()
        ) {
          earnedPoints += question.points
        }
      }
      // Long answer would need manual grading
    })

    const score = Math.round((earnedPoints / totalPoints) * 100)
    return {
      score,
      passed: score >= form.passingScore,
      totalPoints,
      earnedPoints,
    }
  }

  const handleSubmitExam = () => {
    const result = calculateScore()
    setSubmissionResult(result)
    setExamSubmitted(true)
    setShowSubmitConfirm(false)
    setShowTimeUpDialog(false)
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((key) => {
      const answer = answers[key]
      if (Array.isArray(answer)) return answer.length > 0
      return answer && answer.trim() !== ""
    }).length
  }

  const isQuestionAnswered = (questionId: string) => {
    const answer = answers[questionId]
    if (Array.isArray(answer)) return answer.length > 0
    return answer && answer.trim() !== ""
  }

  // Start Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-primary-foreground text-2xl">CAT</span>
            </div>
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">{form.description}</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Form Code</p>
                <p className="font-medium">{form.formCode}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{form.department}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Time Limit</p>
                <p className="font-medium">{form.timeLimit} minutes</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Questions</p>
                <p className="font-medium">{totalQuestions} questions</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Anti-Cheating Monitoring</p>
                  <p className="text-orange-700 mt-1">
                    This exam monitors your browser activity. Switching tabs or leaving
                    the exam window will be recorded. After {MAX_VIOLATIONS} violations,
                    your exam will be automatically submitted.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  placeholder="Enter your employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeName">Full Name *</Label>
                <Input
                  id="employeeName"
                  placeholder="Enter your full name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleStartExam}
              disabled={!employeeId.trim() || !employeeName.trim()}
              className="w-full"
              size="lg"
            >
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results Screen
  if (examSubmitted && submissionResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center border-b">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                submissionResult.passed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
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
              <p className="text-6xl font-bold text-foreground">
                {submissionResult.score}%
              </p>
              <p className="text-muted-foreground mt-2">
                {submissionResult.earnedPoints} / {submissionResult.totalPoints} points
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Passing Score</p>
                <p className="font-medium">{form.passingScore}%</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Your Score</p>
                <p
                  className={`font-medium ${
                    submissionResult.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {submissionResult.score}%
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Questions Answered</p>
                <p className="font-medium">
                  {getAnsweredCount()} / {totalQuestions}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground">Tab Violations</p>
                <p
                  className={`font-medium ${
                    violationCount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
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
                      Your exam administrator has been notified and may review your
                      results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>Employee: {employeeName}</p>
              <p>ID: {employeeId}</p>
              <p className="mt-2">
                Submitted on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Exam Screen
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
        {/* Question Navigation Pills */}
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

        {/* Current Question */}
        <ExamQuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          answer={answers[currentQuestion.id] || (currentQuestion.type === "checkbox" ? [] : "")}
          onAnswerChange={handleAnswerChange}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getAnsweredCount()} of {totalQuestions} answered
            </Badge>
          </div>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNextQuestion}>
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

      {/* Violation Warning Modal */}
      <ViolationWarning
        open={showViolationWarning}
        onClose={() => setShowViolationWarning(false)}
        violation={latestViolation}
        violationCount={violationCount}
        maxViolations={MAX_VIOLATIONS}
      />

      {/* Submit Confirmation */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {getAnsweredCount()} of {totalQuestions} questions.
              {getAnsweredCount() < totalQuestions && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Warning: You have {totalQuestions - getAnsweredCount()} unanswered
                  question{totalQuestions - getAnsweredCount() !== 1 ? "s" : ""}.
                </span>
              )}
              <span className="block mt-2">
                Once submitted, you cannot modify your answers.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam}>
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
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
