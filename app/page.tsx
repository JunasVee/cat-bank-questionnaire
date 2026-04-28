"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function RootPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const role = user.role?.toLowerCase()
      if (role === "admin" || role === "administrator") {
        router.replace("/admin/question-bank")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
