"use client"

import Link from "next/link"
import { useState } from "react"
import { getAccount } from "@/lib/appwrite/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const account = getAccount()
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

            await account.createRecovery(
                email,
                `${siteUrl}/reset-password`
            )

            setSubmitted(true)
            toast.success("Reset email sent!", { description: "Check your inbox for instructions." })
        } catch (err: any) {
            const errorMessage = err?.message || "Failed to send reset email"
            setError(errorMessage)
            toast.error("Failed to send reset email", { description: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
                        <CardDescription>
                            We've sent a password reset link to <span className="font-medium text-slate-900 dark:text-slate-100">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Click the link in the email to set a new password.</p>
                            <p className="mt-2 text-xs">If you don't see it, check your spam folder.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/login" className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Sign In
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset your password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleReset} className="space-y-4">
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
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                            {loading ? "Sending link..." : "Send Reset Link"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sign In
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
