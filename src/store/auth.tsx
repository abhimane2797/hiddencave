import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export interface User {
  username: string
  role: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  loading: boolean
}

const DUMMY_USERNAME = 'hiddencave'
const DUMMY_PASSWORD = 'cave@123'
const AUTH_STORAGE_KEY = 'hcgz-auth'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(
    (username: string, password: string) => {
      if (username === DUMMY_USERNAME && password === DUMMY_PASSWORD) {
        const nextUser: User = { username, role: 'operator' }
        setUser(nextUser)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
        return { success: true }
      }
      return { success: false, error: 'Invalid username or password' }
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
