"use client"

import { useState, useCallback } from "react"
import { AdminHeader } from "@/components/admin-header"
import { FormSettings } from "@/components/form-settings"
import { QuestionCard } from "@/components/question-card"
import { AddQuestionButton } from "@/components/add-question-button"
import { mockQuestionnaire } from "@/lib/mock-data"
import { Question, QuestionnaireForm, QuestionType } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle } from "lucide-react"

export default function QuestionnaireAdminPage() {
  const [form, setForm] = useState<QuestionnaireForm>(mockQuestionnaire)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const updateFormSettings = useCallback(
    (updates: Partial<QuestionnaireForm>) => {
      setForm((prev) => ({ ...prev, ...updates, updatedAt: new Date() }))
      setSaveStatus("idle")
    },
    []
  )

  const updateQuestion = useCallback((index: number, question: Question) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
      updatedAt: new Date(),
    }))
    setSaveStatus("idle")
  }, [])

  const deleteQuestion = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      updatedAt: new Date(),
    }))
    setSaveStatus("idle")
  }, [])

  const duplicateQuestion = useCallback((index: number) => {
    setForm((prev) => {
      const questionToDuplicate = prev.questions[index]
      const duplicated: Question = {
        ...questionToDuplicate,
        id: `q-${Date.now()}`,
        choices: questionToDuplicate.choices.map((c) => ({
          ...c,
          id: `${c.id}-copy-${Date.now()}`,
        })),
      }
      const newQuestions = [...prev.questions]
      newQuestions.splice(index + 1, 0, duplicated)
      return {
        ...prev,
        questions: newQuestions,
        updatedAt: new Date(),
      }
    })
    setSaveStatus("idle")
  }, [])

  const moveQuestion = useCallback((index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const newQuestions = [...prev.questions]
      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newQuestions.length) return prev
      ;[newQuestions[index], newQuestions[newIndex]] = [
        newQuestions[newIndex],
        newQuestions[index],
      ]
      return {
        ...prev,
        questions: newQuestions,
        updatedAt: new Date(),
      }
    })
    setSaveStatus("idle")
  }, [])

  const addQuestion = useCallback((type: QuestionType) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: "",
      type,
      required: true,
      points: 10,
      choices:
        type === "true-false"
          ? [
              { id: `tf-t-${Date.now()}`, text: "True", isCorrect: false },
              { id: `tf-f-${Date.now()}`, text: "False", isCorrect: false },
            ]
          : type === "multiple-choice" || type === "checkbox"
            ? [
                { id: `opt-1-${Date.now()}`, text: "Option 1", isCorrect: false },
                { id: `opt-2-${Date.now()}`, text: "Option 2", isCorrect: false },
              ]
            : [],
      correctAnswer: type === "short-answer" || type === "long-answer" ? "" : undefined,
    }

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      updatedAt: new Date(),
    }))
    setSaveStatus("idle")
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("idle")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real app, you would save to your database here
    console.log("[v0] Saving form data:", form)

    setIsSaving(false)
    setLastSaved(new Date())
    setSaveStatus("success")

    // Reset success message after 5 seconds
    setTimeout(() => {
      setSaveStatus("idle")
    }, 5000)
  }

  const totalPoints = form.questions.reduce((sum, q) => sum + q.points, 0)
  const requiredQuestions = form.questions.filter((q) => q.required).length

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        formCode={form.formCode}
        onSave={handleSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Save Status Alert */}
        {saveStatus === "success" && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Form Saved Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              Your questionnaire has been saved. Changes are now live.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Warning */}
        {form.questions.some(
          (q) =>
            !q.text ||
            ((q.type === "multiple-choice" ||
              q.type === "checkbox" ||
              q.type === "true-false") &&
              !q.choices.some((c) => c.isCorrect))
        ) && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Incomplete Questions</AlertTitle>
            <AlertDescription className="text-amber-700">
              Some questions are missing text or correct answers. Please review before
              publishing.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{form.title}</h2>
                <p className="text-muted-foreground mt-1">{form.description}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {form.questions.length} questions · {totalPoints} points
                </p>
                <p className="text-xs text-muted-foreground">
                  {requiredQuestions} required
                </p>
              </div>
            </div>

            {form.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                totalQuestions={form.questions.length}
                onUpdate={(q) => updateQuestion(index, q)}
                onDelete={() => deleteQuestion(index)}
                onDuplicate={() => duplicateQuestion(index)}
                onMoveUp={() => moveQuestion(index, "up")}
                onMoveDown={() => moveQuestion(index, "down")}
              />
            ))}

            <AddQuestionButton onAddQuestion={addQuestion} />
          </div>

          {/* Sidebar - Form Settings */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <FormSettings form={form} onUpdate={updateFormSettings} />
          </div>
        </div>
      </main>
    </div>
  )
}
