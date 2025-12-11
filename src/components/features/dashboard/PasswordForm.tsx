"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updatePassword } from "@/lib/actions/user"
import { Check, Loader2, Eye, EyeOff } from "lucide-react"

interface PasswordFormProps {
    email: string
}

export function PasswordForm({ email }: PasswordFormProps) {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' })
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
            return
        }

        startTransition(async () => {
            const result = await updatePassword({ newPassword })

            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Password updated!' })
                setNewPassword("")
                setConfirmPassword("")
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Update your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            readOnly
                            className="bg-muted cursor-not-allowed"
                            aria-label="Current email address (read-only)"
                        />
                        <p className="text-xs text-muted-foreground">
                            To change your email, please contact support.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((level) => {
                                        const strength =
                                            (newPassword.length >= 8 ? 1 : 0) +
                                            (/[A-Z]/.test(newPassword) ? 1 : 0) +
                                            (/[0-9]/.test(newPassword) ? 1 : 0) +
                                            (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0)
                                        return (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strength
                                                        ? strength <= 1 ? 'bg-red-500'
                                                            : strength <= 2 ? 'bg-yellow-500'
                                                                : strength <= 3 ? 'bg-blue-500'
                                                                    : 'bg-emerald-500'
                                                        : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}
                                            />
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {newPassword.length < 8 && "• Use at least 8 characters"}
                                    {newPassword.length >= 8 && !/[A-Z]/.test(newPassword) && "• Add an uppercase letter"}
                                    {newPassword.length >= 8 && /[A-Z]/.test(newPassword) && !/[0-9]/.test(newPassword) && "• Add a number"}
                                    {newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && !/[^A-Za-z0-9]/.test(newPassword) && "• Add a special character"}
                                    {newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) && "✓ Strong password"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                            }`}>
                            {message.type === 'success' && <Check className="inline-block w-4 h-4 mr-2" />}
                            {message.text}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isPending || !newPassword || !confirmPassword}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
