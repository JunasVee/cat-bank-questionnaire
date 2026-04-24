"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Eye,
  Settings,
  MoreHorizontal,
  Loader2,
  Check,
  Monitor,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminHeaderProps {
  formCode: string
  onSave: () => void
  isSaving: boolean
  lastSaved?: Date
}

export function AdminHeader({
  formCode,
  onSave,
  isSaving,
  lastSaved,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">
                  CAT
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">
                  Questionnaire Admin
                </h1>
                <p className="text-xs text-muted-foreground">
                  Employee Exam Management
                </p>
              </div>
            </div>

            <Badge variant="secondary" className="font-mono text-xs hidden md:flex">
              {formCode}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                Last saved {lastSaved.toLocaleTimeString()}
              </span>
            )}

            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href="/admin/monitoring">
                <Monitor className="h-4 w-4 mr-2" />
                Live Monitor
              </Link>
            </Button>

            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href="/exam">
                <Eye className="h-4 w-4 mr-2" />
                Preview Exam
              </Link>
            </Button>

            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Form
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Form Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/monitoring">
                    <Monitor className="h-4 w-4 mr-2" />
                    Live Monitor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/exam">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Exam
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem>Duplicate Form</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete Form
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
