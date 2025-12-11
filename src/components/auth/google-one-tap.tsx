"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

declare global {
  interface Window {
    google: any
  }
}

interface CredentialResponse {
  credential: string
}

// Note: Google One Tap with Appwrite requires a different implementation
// Appwrite uses OAuth flow, not ID token verification like Supabase
// This component is kept for compatibility but redirects to OAuth flow

export function GoogleOneTapLogin({ onSuccess }: { onSuccess?: () => void }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return

    // Google One Tap is not directly supported with Appwrite
    // Users should use the regular OAuth button instead
    // This is kept as a stub for backward compatibility

    initialized.current = true

    // For Appwrite, we would need to implement a custom flow
    // that first gets the Google ID token, then creates a session with it
    // This is more complex and requires server-side handling

    console.log("Google One Tap is not supported with Appwrite. Please use the OAuth button.")

    // Cleanup function
    return () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.cancel()
      }
    }
  }, [onSuccess])

  return null
}