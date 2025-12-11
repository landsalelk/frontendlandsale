"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/lib/actions/user"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfileFormProps {
    initialData: {
        fullName: string
        phone: string
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [fullName, setFullName] = useState(initialData.fullName)
    const [phone, setPhone] = useState(initialData.phone)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        startTransition(async () => {
            const result = await updateProfile({ fullName, phone })

            if (result.error) {
                setMessage({ type: 'error', text: result.error })
                toast.error("Update failed", { description: result.error })
            } else if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Profile updated!' })
                toast.success("Profile updated", { description: "Your changes have been saved" })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="Your Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9+\s-]*"
                            maxLength={15}
                            placeholder="+94 77 123 4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isPending}
                            aria-describedby="phone-hint"
                        />
                        <p id="phone-hint" className="text-xs text-muted-foreground">
                            Sri Lankan format: +94 77 123 4567 or 077 123 4567
                        </p>
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
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
