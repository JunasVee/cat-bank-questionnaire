"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, Target, Building2 } from "lucide-react"
import { QuestionnaireForm } from "@/lib/types"

interface FormSettingsProps {
  form: QuestionnaireForm
  onUpdate: (updates: Partial<QuestionnaireForm>) => void
}

const departments = [
  "Operations",
  "Engineering",
  "Manufacturing",
  "Safety",
  "Human Resources",
  "Finance",
  "IT",
  "Sales",
  "Marketing",
]

export function FormSettings({ form, onUpdate }: FormSettingsProps) {
  const totalPoints = form.questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Form Settings
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {form.formCode}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Code */}
        <div className="space-y-2">
          <Label htmlFor="formCode" className="flex items-center gap-2">
            Form Code
            <span className="text-xs text-muted-foreground">(Unique Identifier)</span>
          </Label>
          <Input
            id="formCode"
            value={form.formCode}
            onChange={(e) => onUpdate({ formCode: e.target.value })}
            placeholder="e.g., CAT-EMP-2024-001"
            className="font-mono"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Form Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter form title..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Enter form description..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Department
          </Label>
          <Select
            value={form.department}
            onValueChange={(v) => onUpdate({ department: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Limit */}
        <div className="space-y-2">
          <Label htmlFor="timeLimit" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Limit (minutes)
          </Label>
          <Input
            id="timeLimit"
            type="number"
            value={form.timeLimit}
            onChange={(e) =>
              onUpdate({ timeLimit: Math.max(0, parseInt(e.target.value) || 0) })
            }
            min={0}
          />
          <p className="text-xs text-muted-foreground">
            Set to 0 for no time limit
          </p>
        </div>

        {/* Passing Score */}
        <div className="space-y-2">
          <Label htmlFor="passingScore" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Passing Score (%)
          </Label>
          <Input
            id="passingScore"
            type="number"
            value={form.passingScore}
            onChange={(e) =>
              onUpdate({
                passingScore: Math.min(
                  100,
                  Math.max(0, parseInt(e.target.value) || 0)
                ),
              })
            }
            min={0}
            max={100}
          />
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Form Summary
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {form.questions.length}
              </p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalPoints}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
