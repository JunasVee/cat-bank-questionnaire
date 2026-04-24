export type QuestionType = 
  | "multiple-choice" 
  | "checkbox" 
  | "true-false" 
  | "short-answer" 
  | "long-answer"

export interface AnswerChoice {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  required: boolean
  points: number
  choices: AnswerChoice[]
  correctAnswer?: string // For short/long answer
}

export interface QuestionnaireForm {
  id: string
  formCode: string
  title: string
  description: string
  department: string
  timeLimit: number // in minutes
  passingScore: number
  questions: Question[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ViolationRecord {
  id: string
  type: "tab_switch" | "window_blur" | "right_click" | "copy_paste"
  timestamp: Date
  description: string
}

export type ExamStatus = "in_progress" | "completed" | "terminated"

export interface ExamSession {
  id: string
  formCode: string
  employeeId: string
  employeeName: string
  department: string
  status: ExamStatus
  startTime: Date
  endTime?: Date
  violations: ViolationRecord[]
  score?: number
  totalPoints?: number
  passed?: boolean
  answers: Record<string, string | string[]>
}
