"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  GripVertical,
  Copy,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react"
import { Question, QuestionType, AnswerChoice } from "@/lib/types"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: Question
  index: number
  totalQuestions: number
  onUpdate: (question: Question) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const questionTypeLabels: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  checkbox: "Checkbox (Multiple Answers)",
  "true-false": "True / False",
  "short-answer": "Short Answer",
  "long-answer": "Long Answer (Essay)",
}

export function QuestionCard({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleQuestionTextChange = (text: string) => {
    onUpdate({ ...question, text })
  }

  const handleTypeChange = (type: QuestionType) => {
    let newChoices: AnswerChoice[] = []

    if (type === "true-false") {
      newChoices = [
        { id: `${question.id}-t`, text: "True", isCorrect: false },
        { id: `${question.id}-f`, text: "False", isCorrect: false },
      ]
    } else if (type === "multiple-choice" || type === "checkbox") {
      newChoices =
        question.choices.length > 0
          ? question.choices
          : [
              { id: `${question.id}-1`, text: "Option 1", isCorrect: false },
              { id: `${question.id}-2`, text: "Option 2", isCorrect: false },
            ]
    }

    onUpdate({
      ...question,
      type,
      choices: newChoices,
      correctAnswer: type === "short-answer" || type === "long-answer" ? "" : undefined,
    })
  }

  const handlePointsChange = (points: number) => {
    onUpdate({ ...question, points: Math.max(0, points) })
  }

  const handleRequiredChange = (required: boolean) => {
    onUpdate({ ...question, required })
  }

  const handleChoiceTextChange = (choiceId: string, text: string) => {
    const newChoices = question.choices.map((c) =>
      c.id === choiceId ? { ...c, text } : c
    )
    onUpdate({ ...question, choices: newChoices })
  }

  const handleCorrectAnswerToggle = (choiceId: string) => {
    let newChoices: AnswerChoice[]

    if (question.type === "checkbox") {
      newChoices = question.choices.map((c) =>
        c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c
      )
    } else {
      newChoices = question.choices.map((c) => ({
        ...c,
        isCorrect: c.id === choiceId,
      }))
    }

    onUpdate({ ...question, choices: newChoices })
  }

  const handleAddChoice = () => {
    const newChoice: AnswerChoice = {
      id: `${question.id}-${Date.now()}`,
      text: `Option ${question.choices.length + 1}`,
      isCorrect: false,
    }
    onUpdate({ ...question, choices: [...question.choices, newChoice] })
  }

  const handleRemoveChoice = (choiceId: string) => {
    if (question.choices.length <= 2) return
    const newChoices = question.choices.filter((c) => c.id !== choiceId)
    onUpdate({ ...question, choices: newChoices })
  }

  const handleCorrectAnswerChange = (answer: string) => {
    onUpdate({ ...question, correctAnswer: answer })
  }

  const hasCorrectAnswer = question.choices.some((c) => c.isCorrect)

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              Q{index + 1}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <Textarea
              value={question.text}
              onChange={(e) => handleQuestionTextChange(e.target.value)}
              placeholder="Enter your question here..."
              className="min-h-[60px] text-base font-medium resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Type:</Label>
                <Select
                  value={question.type}
                  onValueChange={(v) => handleTypeChange(v as QuestionType)}
                >
                  <SelectTrigger className="w-[200px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(questionTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Points:</Label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)}
                  className="w-20 h-8"
                  min={0}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={handleRequiredChange}
                />
                <Label
                  htmlFor={`required-${question.id}`}
                  className="text-sm text-muted-foreground"
                >
                  Required
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveDown}
              disabled={index === totalQuestions - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDuplicate}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Multiple Choice / Checkbox Options */}
        {(question.type === "multiple-choice" ||
          question.type === "checkbox" ||
          question.type === "true-false") && (
          <div className="space-y-2 ml-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Check className="h-3 w-3" />
              <span>
                Click the{" "}
                {question.type === "checkbox" ? "checkboxes" : "radio button"} to
                mark correct answer(s)
              </span>
              {!hasCorrectAnswer && (
                <span className="text-amber-600 font-medium">
                  - No correct answer set!
                </span>
              )}
            </div>

            {question.choices.map((choice, choiceIndex) => (
              <div
                key={choice.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  choice.isCorrect && "bg-green-50 border border-green-200"
                )}
              >
                {question.type === "checkbox" ? (
                  <Checkbox
                    checked={choice.isCorrect}
                    onCheckedChange={() => handleCorrectAnswerToggle(choice.id)}
                    className={cn(
                      choice.isCorrect && "bg-green-600 border-green-600 text-white"
                    )}
                  />
                ) : (
                  <RadioGroup value={choice.isCorrect ? choice.id : ""}>
                    <RadioGroupItem
                      value={choice.id}
                      onClick={() => handleCorrectAnswerToggle(choice.id)}
                      className={cn(
                        choice.isCorrect && "border-green-600 text-green-600"
                      )}
                    />
                  </RadioGroup>
                )}

                <Input
                  value={choice.text}
                  onChange={(e) =>
                    handleChoiceTextChange(choice.id, e.target.value)
                  }
                  placeholder={`Option ${choiceIndex + 1}`}
                  className="flex-1"
                  disabled={question.type === "true-false"}
                />

                {choice.isCorrect && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Correct
                  </span>
                )}

                {question.type !== "true-false" && question.choices.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveChoice(choice.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {question.type !== "true-false" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 ml-6"
                onClick={handleAddChoice}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>
        )}

        {/* Short Answer */}
        {question.type === "short-answer" && (
          <div className="space-y-3 ml-8">
            <Label className="text-sm text-muted-foreground">
              Expected Answer (for grading reference):
            </Label>
            <Input
              value={question.correctAnswer || ""}
              onChange={(e) => handleCorrectAnswerChange(e.target.value)}
              placeholder="Enter the expected answer..."
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Respondents will see a single-line text input
            </p>
          </div>
        )}

        {/* Long Answer */}
        {question.type === "long-answer" && (
          <div className="space-y-3 ml-8">
            <Label className="text-sm text-muted-foreground">
              Answer Key / Grading Guidelines:
            </Label>
            <Textarea
              value={question.correctAnswer || ""}
              onChange={(e) => handleCorrectAnswerChange(e.target.value)}
              placeholder="Enter expected answer or grading guidelines..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Respondents will see a multi-line text area for their response
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
