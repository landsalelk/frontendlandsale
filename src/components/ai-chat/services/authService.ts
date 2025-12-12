// Appwrite-based Auth Service for AI Chat
import { getAccount } from '../../../lib/appwrite/client'
import { ID, OAuthProvider } from 'appwrite'

export interface AuthResponse {
  user: any | null
  session: any | null
  error: Error | null
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  avatar_url?: string
}

export class AuthService {
  private static instance: AuthService

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<AuthResponse> {
    try {
      const account = getAccount()
      const user = await account.create(
        ID.unique(),
        email,
        password,
        metadata?.full_name
      )

      // Auto sign in after signup
      const session = await account.createEmailPasswordSession(email, password)

      // Store session in cookie
      document.cookie = `appwrite-session=${session.$id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

      return {
        user,
        session,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const account = getAccount()
      const session = await account.createEmailPasswordSession(email, password)
      const user = await account.get()

      // Store session in cookie
      document.cookie = `appwrite-session=${session.$id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

      return {
        user,
        session,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const account = getAccount()
      account.createOAuth2Session(
        'google' as OAuthProvider,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login`
      )

      return {
        user: null,
        session: null,
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const account = getAccount()
      await account.deleteSession('current')

      // Clear session cookie
      document.cookie = 'appwrite-session=; path=/; max-age=0'

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const account = getAccount()
      await account.createRecovery(
        email,
        `${window.location.origin}/auth/reset-password`
      )
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const account = getAccount()
      await account.updatePassword(newPassword)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      const account = getAccount()
      try {
        const user = await account.get()
        return user
      } catch (accountError: any) {
        if (accountError.message?.includes('missing scopes') && 
            accountError.message?.includes('account')) {
          console.warn("Session valid but API key lacks account scope.")
          return { $id: 'session-user', email: 'user@session.valid', name: 'Session User' }
        }
        throw accountError
      }
    } catch (error: any) {
      console.error('Session validation failed:', error.message)
      return null
    }
  }

  async getCurrentSession(): Promise<any | null> {
    try {
      const account = getAccount()
      return await account.getSession('current')
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  // Note: Appwrite doesn't have real-time auth state changes like Supabase
  // You'll need to implement polling or use other mechanisms
  onAuthStateChange(callback: (event: string, session: any | null) => void) {
    // Return a mock subscription object
    return {
      data: { subscription: { unsubscribe: () => { } } }
    }
  }
}

export const authService = AuthService.getInstance()