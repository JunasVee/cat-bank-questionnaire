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
  createdAt: Date
  updatedAt: Date
}
