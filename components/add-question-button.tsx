"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  Type,
  AlignLeft,
} from "lucide-react"
import { QuestionType } from "@/lib/types"

interface AddQuestionButtonProps {
  onAddQuestion: (type: QuestionType) => void
}

const questionTypes: { type: QuestionType; label: string; icon: React.ReactNode }[] = [
  {
    type: "multiple-choice",
    label: "Multiple Choice",
    icon: <CircleDot className="h-4 w-4" />,
  },
  {
    type: "checkbox",
    label: "Checkbox (Multiple Answers)",
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    type: "true-false",
    label: "True / False",
    icon: <ToggleLeft className="h-4 w-4" />,
  },
  {
    type: "short-answer",
    label: "Short Answer",
    icon: <Type className="h-4 w-4" />,
  },
  {
    type: "long-answer",
    label: "Long Answer (Essay)",
    icon: <AlignLeft className="h-4 w-4" />,
  },
]

export function AddQuestionButton({ onAddQuestion }: AddQuestionButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary h-14">
          <Plus className="h-5 w-5 mr-2" />
          Add New Question
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        {questionTypes.map((qt) => (
          <DropdownMenuItem
            key={qt.type}
            onClick={() => onAddQuestion(qt.type)}
            className="cursor-pointer py-3"
          >
            {qt.icon}
            <span className="ml-2">{qt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
