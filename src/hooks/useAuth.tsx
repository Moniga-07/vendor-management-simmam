import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { AuthUser, LoginCredentials } from '@/types'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Just mock session check by token existence (for now)
    const checkSession = async () => {
      const session = await authService.getSession()
      if (session) {
        // Here we'd ideally fetch the user profile from the backend using the token
        // For simplicity, we just set a dummy user if token exists
        setUser({ id: 'coordinator_1', email: 'coordinator@simmam.com' })
      }
      setIsLoading(false)
    }
    checkSession()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    // Bypass backend authentication for now
    setUser({ id: 'dev_user', email: credentials.email })
    localStorage.setItem('simmam_auth_token', 'dev_token_bypass')
    navigate(ROUTES.DASHBOARD)
  }

  const logout = async () => {
    localStorage.removeItem('simmam_auth_token')
    setUser(null)
    navigate(ROUTES.LOGIN)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
