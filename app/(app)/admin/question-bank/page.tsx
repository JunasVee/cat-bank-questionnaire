"use client"

import { useState, useEffect } from "react"
import { FormSettings } from "@/components/form-settings"
import { QuestionCard } from "@/components/question-card"
import { AddQuestionButton } from "@/components/add-question-button"
import { QuestionnaireTable } from "@/components/questionnaire-table"
import { Question, QuestionnaireForm, QuestionType } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, Loader2, Save } from "lucide-react"

export default function QuestionBankPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireForm[]>([])
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const activeQuestionnaire = questionnaires.find((q) => q.id === activeQuestionnaireId)

  useEffect(() => {
    fetchQuestionnaires()
  }, [])

  async function fetchQuestionnaires() {
    setIsFetching(true)
    try {
      const res = await fetch("/api/questionnaires")
      const data = await res.json()
      if (res.ok) {
        setQuestionnaires(data)
        if (data.length > 0 && !activeQuestionnaireId) {
          loadQuestionnaire(data[0].id, data)
        }
      }
    } catch (err) {
      console.error("Failed to fetch questionnaires", err)
    } finally {
      setIsFetching(false)
    }
  }

  async function loadQuestionnaire(id: string, list?: QuestionnaireForm[]) {
    setIsLoadingQuestions(true)
    setActiveQuestionnaireId(id)
    try {
      const res = await fetch(`/api/questionnaires/${id}`)
      const data = await res.json()
      if (res.ok) {
        const source = list ?? questionnaires
        setQuestionnaires(source.map((q) => (q.id === id ? { ...q, ...data } : q)))
      }
    } catch (err) {
      console.error("Failed to load questionnaire", err)
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
          ? { ...q, questions: q.questions.map((qst, i) => (i === index ? question : qst)), updatedAt: new Date() }
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
          ? { ...q, questions: q.questions.filter((_, i) => i !== index), updatedAt: new Date() }
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
      choices: questionToDuplicate.choices.map((c) => ({ ...c, id: `${c.id}-copy-${Date.now()}` })),
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
        ;[newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
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
    if (!activeQuestionnaire) return
    setIsSaving(true)
    setSaveStatus("idle")
    try {
      const res = await fetch(`/api/questionnaires/${activeQuestionnaire.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeQuestionnaire),
      })
      if (res.ok) {
        await loadQuestionnaire(activeQuestionnaire.id)
        setLastSaved(new Date())
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 5000)
      } else {
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectQuestionnaire = (questionnaire: QuestionnaireForm) => {
    setSaveStatus("idle")
    if (questionnaire.questions.length === 0) {
      loadQuestionnaire(questionnaire.id)
    } else {
      setActiveQuestionnaireId(questionnaire.id)
    }
  }

  const handleAddQuestionnaire = async (questionnaire: QuestionnaireForm) => {
    try {
      const res = await fetch("/api/questionnaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionnaire),
      })
      const data = await res.json()
      if (res.ok) {
        const newQ: QuestionnaireForm = { ...questionnaire, id: data.id }
        setQuestionnaires((prev) => [newQ, ...prev])
        setActiveQuestionnaireId(data.id)
      }
    } catch (err) {
      console.error("Failed to create questionnaire", err)
    }
  }

  const handleDeleteQuestionnaire = async (id: string) => {
    try {
      const res = await fetch(`/api/questionnaires/${id}`, { method: "DELETE" })
      if (res.ok) {
        const remaining = questionnaires.filter((q) => q.id !== id)
        setQuestionnaires(remaining)
        if (activeQuestionnaireId === id) {
          if (remaining.length > 0) loadQuestionnaire(remaining[0].id, remaining)
          else setActiveQuestionnaireId(null)
        }
      }
    } catch (err) {
      console.error("Failed to delete questionnaire", err)
    }
  }

  const handleToggleActive = async (id: string) => {
    const target = questionnaires.find((q) => q.id === id)
    if (!target) return
    const updated = { ...target, isActive: !target.isActive }
    try {
      const res = await fetch(`/api/questionnaires/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (res.ok) setQuestionnaires((prev) => prev.map((q) => (q.id === id ? updated : q)))
    } catch (err) {
      console.error("Failed to toggle active status", err)
    }
  }

  const handleDuplicateQuestionnaire = async (questionnaire: QuestionnaireForm) => {
    const duplicated: QuestionnaireForm = {
      ...questionnaire,
      id: `q-${Date.now()}`,
      formCode: `${questionnaire.formCode}-COPY`,
      title: `${questionnaire.title} (Copy)`,
      questions: questionnaire.questions.map((q) => ({
        ...q,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        choices: q.choices.map((c) => ({ ...c, id: `${c.id}-${Date.now()}` })),
      })),
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await handleAddQuestionnaire(duplicated)
  }

  const totalPoints = activeQuestionnaire?.questions.reduce((sum, q) => sum + q.points, 0) || 0
  const requiredQuestions = activeQuestionnaire?.questions.filter((q) => q.required).length || 0

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Manage questionnaires and exam questions.</p>
        </div>
        {activeQuestionnaire && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save</>
            )}
          </Button>
        )}
      </div>

      <QuestionnaireTable
        questionnaires={questionnaires}
        activeQuestionnaireId={activeQuestionnaireId}
        onSelect={handleSelectQuestionnaire}
        onAdd={handleAddQuestionnaire}
        onDelete={handleDeleteQuestionnaire}
        onToggleActive={handleToggleActive}
        onDuplicate={handleDuplicateQuestionnaire}
      />

      {saveStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Saved Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            Questionnaire saved to the database.
          </AlertDescription>
        </Alert>
      )}
      {saveStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Save Failed</AlertTitle>
          <AlertDescription className="text-red-700">
            Could not save. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoadingQuestions && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!activeQuestionnaire && !isLoadingQuestions && (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">Select a questionnaire above to edit its questions.</p>
        </div>
      )}

      {activeQuestionnaire && !isLoadingQuestions && (
        <>
          {activeQuestionnaire.questions.some(
            (q) =>
              !q.text ||
              ((q.type === "multiple-choice" || q.type === "checkbox" || q.type === "true-false") &&
                !q.choices.some((c) => c.isCorrect))
          ) && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Incomplete Questions</AlertTitle>
              <AlertDescription className="text-amber-700">
                Some questions are missing text or correct answers.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{activeQuestionnaire.title}</h2>
                  <p className="text-muted-foreground mt-1">
                    {activeQuestionnaire.description || "No description provided"}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-muted-foreground">
                    {activeQuestionnaire.questions.length} questions · {totalPoints} pts
                  </p>
                  <p className="text-xs text-muted-foreground">{requiredQuestions} required</p>
                </div>
              </div>

              {activeQuestionnaire.questions.length === 0 ? (
                <div className="text-center py-12 bg-card border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">No questions yet.</p>
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

            <div className="lg:sticky lg:top-24 lg:h-fit">
              <FormSettings form={activeQuestionnaire} onUpdate={updateFormSettings} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
