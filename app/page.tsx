"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AdminHeader } from "@/components/admin-header"
import { FormSettings } from "@/components/form-settings"
import { QuestionCard } from "@/components/question-card"
import { AddQuestionButton } from "@/components/add-question-button"
import { QuestionnaireTable } from "@/components/questionnaire-table"
import { mockQuestionnaires } from "@/lib/mock-data"
import { Question, QuestionnaireForm, QuestionType } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

export default function QuestionnaireAdminPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireForm[]>(mockQuestionnaires)
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(mockQuestionnaires[0]?.id || null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const activeQuestionnaire = questionnaires.find((q) => q.id === activeQuestionnaireId)

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null
  }

  const updateFormSettings = (updates: Partial<QuestionnaireForm>) => {
    if (!activeQuestionnaireId) return
    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === activeQuestionnaireId ? { ...q, ...updates, updatedAt: new Date() } : q
      )
    )
    setSaveStatus("idle")
  }

  const updateQuestion = (index: number, question: Question) => {
    if (!activeQuestionnaireId) return
    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === activeQuestionnaireId
          ? {
              ...q,
              questions: q.questions.map((qst, i) => (i === index ? question : qst)),
              updatedAt: new Date(),
            }
          : q
      )
    )
    setSaveStatus("idle")
  }

  const deleteQuestion = (index: number) => {
    if (!activeQuestionnaireId) return
    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === activeQuestionnaireId
          ? {
              ...q,
              questions: q.questions.filter((_, i) => i !== index),
              updatedAt: new Date(),
            }
          : q
      )
    )
    setSaveStatus("idle")
  }

  const duplicateQuestion = (index: number) => {
    if (!activeQuestionnaireId || !activeQuestionnaire) return
    const questionToDuplicate = activeQuestionnaire.questions[index]
    const duplicated: Question = {
      ...questionToDuplicate,
      id: `q-${Date.now()}`,
      choices: questionToDuplicate.choices.map((c) => ({
        ...c,
        id: `${c.id}-copy-${Date.now()}`,
      })),
    }
    setQuestionnaires((prev) =>
      prev.map((q) => {
        if (q.id !== activeQuestionnaireId) return q
        const newQuestions = [...q.questions]
        newQuestions.splice(index + 1, 0, duplicated)
        return { ...q, questions: newQuestions, updatedAt: new Date() }
      })
    )
    setSaveStatus("idle")
  }

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (!activeQuestionnaireId || !activeQuestionnaire) return
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= activeQuestionnaire.questions.length) return

    setQuestionnaires((prev) =>
      prev.map((q) => {
        if (q.id !== activeQuestionnaireId) return q
        const newQuestions = [...q.questions]
        ;[newQuestions[index], newQuestions[newIndex]] = [
          newQuestions[newIndex],
          newQuestions[index],
        ]
        return { ...q, questions: newQuestions, updatedAt: new Date() }
      })
    )
    setSaveStatus("idle")
  }

  const addQuestion = (type: QuestionType) => {
    if (!activeQuestionnaireId) return
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

    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === activeQuestionnaireId
          ? { ...q, questions: [...q.questions, newQuestion], updatedAt: new Date() }
          : q
      )
    )
    setSaveStatus("idle")
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("idle")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Saving form data:", activeQuestionnaire)

    setIsSaving(false)
    setLastSaved(new Date())
    setSaveStatus("success")

    setTimeout(() => {
      setSaveStatus("idle")
    }, 5000)
  }

  // Questionnaire Table Handlers
  const handleSelectQuestionnaire = (questionnaire: QuestionnaireForm) => {
    setActiveQuestionnaireId(questionnaire.id)
    setSaveStatus("idle")
  }

  const handleAddQuestionnaire = (questionnaire: QuestionnaireForm) => {
    setQuestionnaires((prev) => [...prev, questionnaire])
    setActiveQuestionnaireId(questionnaire.id)
  }

  const handleDeleteQuestionnaire = (id: string) => {
    setQuestionnaires((prev) => prev.filter((q) => q.id !== id))
    if (activeQuestionnaireId === id) {
      setActiveQuestionnaireId(questionnaires[0]?.id || null)
    }
  }

  const handleToggleActive = (id: string) => {
    setQuestionnaires((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, isActive: !q.isActive, updatedAt: new Date() } : q
      )
    )
  }

  const handleDuplicateQuestionnaire = (questionnaire: QuestionnaireForm) => {
    const duplicated: QuestionnaireForm = {
      ...questionnaire,
      id: `q-${Date.now()}`,
      formCode: `${questionnaire.formCode}-COPY`,
      title: `${questionnaire.title} (Copy)`,
      questions: questionnaire.questions.map((q) => ({
        ...q,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        choices: q.choices.map((c) => ({
          ...c,
          id: `${c.id}-${Date.now()}`,
        })),
      })),
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setQuestionnaires((prev) => [...prev, duplicated])
    setActiveQuestionnaireId(duplicated.id)
  }

  const totalPoints = activeQuestionnaire?.questions.reduce((sum, q) => sum + q.points, 0) || 0
  const requiredQuestions = activeQuestionnaire?.questions.filter((q) => q.required).length || 0

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        formCode={activeQuestionnaire?.formCode || ""}
        onSave={handleSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Questionnaire Table */}
        <div className="mb-8">
          <QuestionnaireTable
            questionnaires={questionnaires}
            activeQuestionnaireId={activeQuestionnaireId}
            onSelect={handleSelectQuestionnaire}
            onAdd={handleAddQuestionnaire}
            onDelete={handleDeleteQuestionnaire}
            onToggleActive={handleToggleActive}
            onDuplicate={handleDuplicateQuestionnaire}
          />
        </div>

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

        {/* No Questionnaire Selected */}
        {!activeQuestionnaire && (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              Select a questionnaire from the table above to edit, or create a new one.
            </p>
          </div>
        )}

        {/* Editor Section */}
        {activeQuestionnaire && (
          <>
            {/* Validation Warning */}
            {activeQuestionnaire.questions.some(
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
                    <h2 className="text-2xl font-bold text-foreground text-balance">
                      {activeQuestionnaire.title}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {activeQuestionnaire.description || "No description provided"}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">
                      {activeQuestionnaire.questions.length} questions · {totalPoints} points
                    </p>
                    <p className="text-xs text-muted-foreground">{requiredQuestions} required</p>
                  </div>
                </div>

                {activeQuestionnaire.questions.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      No questions yet. Add your first question to get started.
                    </p>
                    <AddQuestionButton onAddQuestion={addQuestion} />
                  </div>
                ) : (
                  <>
                    {activeQuestionnaire.questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        totalQuestions={activeQuestionnaire.questions.length}
                        onUpdate={(q) => updateQuestion(index, q)}
                        onDelete={() => deleteQuestion(index)}
                        onDuplicate={() => duplicateQuestion(index)}
                        onMoveUp={() => moveQuestion(index, "up")}
                        onMoveDown={() => moveQuestion(index, "down")}
                      />
                    ))}
                    <AddQuestionButton onAddQuestion={addQuestion} />
                  </>
                )}
              </div>

              {/* Sidebar - Form Settings */}
              <div className="lg:sticky lg:top-24 lg:h-fit">
                <FormSettings form={activeQuestionnaire} onUpdate={updateFormSettings} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
