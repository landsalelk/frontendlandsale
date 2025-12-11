"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { getAccount, validateSession } from "@/lib/appwrite/client"
import { OAuthProvider } from "appwrite"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/dashboard'

    useEffect(() => {
        // Check if user is already logged in
        const checkUser = async () => {
            try {
                const { valid, user } = await validateSession()
                if (valid && user) {
                    router.push(redirectTo)
                }
            } catch (error) {
                // User not logged in, stay on login page
                console.log("User not logged in, staying on login page")
            }
        }
        
        // Only check if we're not already on the login page
        if (window.location.pathname !== '/login') {
            checkUser()
        }
    }, [router, redirectTo])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const account = getAccount()

            // Create email/password session
            const session = await account.createEmailPasswordSession(email, password)

            // Store session in cookie for server-side access
            document.cookie = `appwrite-session=${session.$id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

            toast.success("Welcome back!", { description: "Redirecting to dashboard..." })
            
            // Use a small delay to ensure cookie is set before redirect
            setTimeout(() => {
                router.refresh()
                router.push(redirectTo)
            }, 100)
            
        } catch (err: any) {
            const errorMessage = err?.message || "Invalid email or password"
            setError(errorMessage)
            toast.error("Login failed", { description: errorMessage })
            
            // Clear any invalid session
            document.cookie = 'appwrite-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const account = getAccount()
            // Redirect to Google OAuth
            account.createOAuth2Session(
                OAuthProvider.Google,
                `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
                `${window.location.origin}/login?error=oauth_failed`
            )
        } catch (err: any) {
            toast.error("Google login failed", { description: err?.message })
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Sign in to your account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/forgot-password" className="text-sm font-medium text-emerald-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                    <div>
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
                            Sign up
                        </Link>
                    </div>
                    <Link href="/" className="hover:underline">Back to Home</Link>
                </CardFooter>
            </Card>
        </div>
    )
}