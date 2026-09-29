"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { api, setToken, clearToken, getToken } from "./api"
import type { AuthResponse } from "./types"

interface SessionUser {
  prestamistaId: number
  nombre: string
  email: string
}

interface AuthState {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const SESSION_KEY = "sgp-session"
const AuthContext = createContext<AuthState | undefined>(undefined)

function persistSession(user: SessionUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }
}

function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    const session = readSession()
    if (token && session) setUser(session)
    setLoading(false)
  }, [])

  const applyAuth = useCallback((res: AuthResponse) => {
    setToken(res.token)
    const session: SessionUser = {
      prestamistaId: res.prestamistaId,
      nombre: res.nombre,
      email: res.email,
    }
    persistSession(session)
    setUser(session)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>("/api/v1/auth/login", {
        body: { email, password },
      })
      applyAuth(res)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (nombre: string, email: string, password: string) => {
      const res = await api.post<AuthResponse>("/api/v1/auth/registro", {
        body: { nombre, email, password },
      })
      applyAuth(res)
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    clearToken()
    if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY)
    setUser(null)
    if (typeof window !== "undefined") window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
