import { useEffect, useState } from 'react'
import { authService } from '../services/authService'

export interface AuthState {
  user: any | null
  session: any | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        const session = await authService.getCurrentSession()

        setAuthState({
          user,
          session,
          loading: false,
          error: null,
        })
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }))
      }
    }

    initializeAuth()

    // Appwrite doesn't have real-time auth state changes like Supabase
    // We'll check auth state on mount
  }, [])

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await authService.signIn(email, password)
      if (result.error) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
        return { success: false, error: result.error }
      }

      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        error: null,
      })

      return { success: true, error: null }
    } catch (error) {
      const errorObj = error as Error
      setAuthState(prev => ({ ...prev, loading: false, error: errorObj }))
      return { success: false, error: errorObj }
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await authService.signUp(email, password, metadata)
      if (result.error) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
        return { success: false, error: result.error }
      }

      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        error: null,
      })

      return { success: true, error: null }
    } catch (error) {
      const errorObj = error as Error
      setAuthState(prev => ({ ...prev, loading: false, error: errorObj }))
      return { success: false, error: errorObj }
    }
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await authService.signOut()
      if (result.error) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
        return { success: false, error: result.error }
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      })

      return { success: true, error: null }
    } catch (error) {
      const errorObj = error as Error
      setAuthState(prev => ({ ...prev, loading: false, error: errorObj }))
      return { success: false, error: errorObj }
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!authState.user,
  }
}

export function useRequireAuth() {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login or handle unauthenticated user
      console.warn('User is not authenticated')
    }
  }, [auth.loading, auth.user])

  return auth
}