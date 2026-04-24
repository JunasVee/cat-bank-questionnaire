"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Question } from "@/lib/types"

interface ExamQuestionCardProps {
  question: Question
  questionNumber: number
  answer: string | string[]
  onAnswerChange: (questionId: string, answer: string | string[]) => void
}

export function ExamQuestionCard({
  question,
  questionNumber,
  answer,
  onAnswerChange,
}: ExamQuestionCardProps) {
  const handleMultipleChoiceChange = (value: string) => {
    onAnswerChange(question.id, value)
  }

  const handleCheckboxChange = (choiceId: string, checked: boolean) => {
    const currentAnswers = Array.isArray(answer) ? answer : []
    if (checked) {
      onAnswerChange(question.id, [...currentAnswers, choiceId])
    } else {
      onAnswerChange(question.id, currentAnswers.filter((a) => a !== choiceId))
    }
  }

  const handleTextChange = (value: string) => {
    onAnswerChange(question.id, value)
  }

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case "multiple-choice":
        return "Select one answer"
      case "checkbox":
        return "Select all that apply"
      case "true-false":
        return "Select True or False"
      case "short-answer":
        return "Enter your answer"
      case "long-answer":
        return "Write your response"
      default:
        return ""
    }
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                Question {questionNumber}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.points} pts
              </Badge>
              {question.required && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  Required
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-medium leading-relaxed">
              {question.text}
            </CardTitle>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {getQuestionTypeLabel()}
        </p>
      </CardHeader>
      <CardContent>
        {/* Multiple Choice */}
        {question.type === "multiple-choice" && (
          <RadioGroup
            value={typeof answer === "string" ? answer : ""}
            onValueChange={handleMultipleChoiceChange}
            className="space-y-3"
          >
            {question.choices.map((choice, index) => (
              <div
                key={choice.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer hover:bg-muted/50 ${
                  answer === choice.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <RadioGroupItem value={choice.id} id={choice.id} />
                <Label
                  htmlFor={choice.id}
                  className="flex-1 cursor-pointer font-normal"
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {choice.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* True/False */}
        {question.type === "true-false" && (
          <RadioGroup
            value={typeof answer === "string" ? answer : ""}
            onValueChange={handleMultipleChoiceChange}
            className="space-y-3"
          >
            {question.choices.map((choice) => (
              <div
                key={choice.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover:bg-muted/50 ${
                  answer === choice.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <RadioGroupItem value={choice.id} id={choice.id} />
                <Label
                  htmlFor={choice.id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {choice.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Checkbox (Multiple Selection) */}
        {question.type === "checkbox" && (
          <div className="space-y-3">
            {question.choices.map((choice, index) => {
              const isChecked = Array.isArray(answer) && answer.includes(choice.id)
              return (
                <div
                  key={choice.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer hover:bg-muted/50 ${
                    isChecked ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleCheckboxChange(choice.id, !isChecked)}
                >
                  <Checkbox
                    id={choice.id}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(choice.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={choice.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {choice.text}
                  </Label>
                </div>
              )
            })}
          </div>
        )}

        {/* Short Answer */}
        {question.type === "short-answer" && (
          <Input
            placeholder="Type your answer here..."
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => handleTextChange(e.target.value)}
            className="text-base"
          />
        )}

        {/* Long Answer */}
        {question.type === "long-answer" && (
          <Textarea
            placeholder="Write your detailed response here..."
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={6}
            className="text-base resize-none"
          />
        )}
      </CardContent>
    </Card>
  )
}
