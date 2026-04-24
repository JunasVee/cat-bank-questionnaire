"use client"

import { useState } from "react"
import { QuestionnaireForm } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Power,
  PowerOff,
  Copy,
  FileText,
} from "lucide-react"

interface QuestionnaireTableProps {
  questionnaires: QuestionnaireForm[]
  activeQuestionnaireId: string | null
  onSelect: (questionnaire: QuestionnaireForm) => void
  onAdd: (questionnaire: QuestionnaireForm) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onDuplicate: (questionnaire: QuestionnaireForm) => void
}

const DEPARTMENTS = [
  "Operations",
  "Human Resources",
  "Information Technology",
  "Maintenance",
  "Finance",
  "Sales",
  "Engineering",
]

export function QuestionnaireTable({
  questionnaires,
  activeQuestionnaireId,
  onSelect,
  onAdd,
  onDelete,
  onToggleActive,
  onDuplicate,
}: QuestionnaireTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<QuestionnaireForm | null>(null)
  const [newForm, setNewForm] = useState({
    title: "",
    formCode: "",
    department: "Operations",
    timeLimit: 60,
    passingScore: 70,
  })

  const handleAdd = () => {
    if (!newForm.title || !newForm.formCode) return

    const questionnaire: QuestionnaireForm = {
      id: `q-${Date.now()}`,
      formCode: newForm.formCode,
      title: newForm.title,
      description: "",
      department: newForm.department,
      timeLimit: newForm.timeLimit,
      passingScore: newForm.passingScore,
      questions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onAdd(questionnaire)
    setShowAddDialog(false)
    setNewForm({
      title: "",
      formCode: "",
      department: "Operations",
      timeLimit: 60,
      passingScore: 70,
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id)
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Questionnaires</h2>
          <Badge variant="secondary" className="ml-2">
            {questionnaires.length} total
          </Badge>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Questionnaire
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Form Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Questions</TableHead>
              <TableHead className="text-center">Time Limit</TableHead>
              <TableHead className="text-center">Pass Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionnaires.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No questionnaires found. Click &quot;Add Questionnaire&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              questionnaires.map((q) => (
                <TableRow
                  key={q.id}
                  className={`cursor-pointer transition-colors ${
                    activeQuestionnaireId === q.id
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSelect(q)}
                >
                  <TableCell>
                    {activeQuestionnaireId === q.id && (
                      <div className="flex items-center justify-center">
                        <Pencil className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{q.formCode}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{q.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{q.department}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{q.questions.length}</TableCell>
                  <TableCell className="text-center">{q.timeLimit} min</TableCell>
                  <TableCell className="text-center">{q.passingScore}%</TableCell>
                  <TableCell>
                    {q.isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(q.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(q); }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(q); }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(q.id); }}>
                          {q.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Set Inactive
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Set Active
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(q)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Questionnaire Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Questionnaire</DialogTitle>
            <DialogDescription>
              Create a new questionnaire for employee assessments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="formCode">Form Code</Label>
              <Input
                id="formCode"
                placeholder="e.g., CAT-EMP-2024-002"
                value={newForm.formCode}
                onChange={(e) => setNewForm({ ...newForm, formCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Safety Assessment Q2 2024"
                value={newForm.title}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newForm.department}
                onValueChange={(value) => setNewForm({ ...newForm, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (min)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={5}
                  max={180}
                  value={newForm.timeLimit}
                  onChange={(e) => setNewForm({ ...newForm, timeLimit: parseInt(e.target.value) || 60 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={0}
                  max={100}
                  value={newForm.passingScore}
                  onChange={(e) => setNewForm({ ...newForm, passingScore: parseInt(e.target.value) || 70 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={!newForm.title || !newForm.formCode}
              className="bg-primary hover:bg-primary/90"
            >
              Create Questionnaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Questionnaire</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
