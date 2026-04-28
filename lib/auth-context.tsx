"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthUser {
  id: number
  username: string
  name: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const authStatus = sessionStorage.getItem("cat-admin-auth")
    const storedUser = sessionStorage.getItem("cat-admin-user")
    if (authStatus === "authenticated" && storedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const isAdminRoute = pathname === "/" || pathname.startsWith("/admin")
      const isLoginPage = pathname === "/login"
      if (isAdminRoute && !isLoginPage) {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error ?? "Login failed" }
      }

      setIsAuthenticated(true)
      setUser(data.user)
      sessionStorage.setItem("cat-admin-auth", "authenticated")
      sessionStorage.setItem("cat-admin-user", JSON.stringify(data.user))
      return { success: true }
    } catch {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    sessionStorage.removeItem("cat-admin-auth")
    sessionStorage.removeItem("cat-admin-user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
