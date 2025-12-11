"use client"

import { getAccount } from "@/lib/appwrite/client"
import { OAuthProvider } from "appwrite"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

export function GoogleLoginButton({ onSuccess }: { onSuccess?: () => void }) {
  const account = getAccount()

  const handleGoogleLogin = async () => {
    console.log("Initiating Google OAuth login with Appwrite")

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      console.error("Cannot initiate Google login outside of browser environment")
      toast.error("Login error", { description: "Cannot initiate login from server side" })
      return
    }

    try {
      // Use Appwrite's OAuth2 flow
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login`
      )

      console.log("Google OAuth initiated successfully")
    } catch (error) {
      console.error("Unexpected error during Google login:", error)
      toast.error("Login failed", { description: "An unexpected error occurred" })
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogleLogin}
      className="w-full"
    >
      <Icons.google className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  )
}