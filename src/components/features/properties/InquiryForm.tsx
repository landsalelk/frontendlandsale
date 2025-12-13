"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { sendInquiry } from "@/lib/actions/inquiry"
import { Check, Loader2, Mail, Send, Lock } from "lucide-react"
import { toast } from "sonner"

interface InquiryFormProps {
    propertyId: string
    sellerId: string
    propertyTitle: string
    isLoggedIn: boolean
}

export function InquiryForm({ propertyId, sellerId, propertyTitle, isLoggedIn }: InquiryFormProps) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [message, setMessage] = useState(`Hi, I'm interested in your property "${propertyTitle}". Please contact me with more details.`)
    const [isPending, startTransition] = useTransition()
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLoggedIn) {
            toast.error("Please log in to send an inquiry")
            return
        }

        startTransition(async () => {
            const result = await sendInquiry({
                propertyId,
                sellerId,
                senderName: name,
                senderEmail: email,
                senderPhone: phone,
                message,
            })

            if (result.error) {
                toast.error("Failed to send", { description: result.error })
            } else if (result.success) {
                setSubmitted(true)
                toast.success("Inquiry sent!", { description: result.message })
            }
        })
    }

    if (submitted) {
        return (
            <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="pt-6">
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
                            <Check className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Inquiry Sent!</h3>
                        <p className="text-sm text-muted-foreground">
                            The seller will receive your message and contact you soon.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    Send Inquiry
                </CardTitle>
                <CardDescription>
                    Contact the seller directly through our platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!isLoggedIn ? (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">
                            Please log in to send an inquiry to the seller.
                        </p>
                        <Button asChild variant="outline">
                            <a href="/login">Log In</a>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="inquiry-name">Your Name *</Label>
                            <Input
                                id="inquiry-name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="inquiry-email">Email</Label>
                                <Input
                                    id="inquiry-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="inquiry-phone">Phone</Label>
                                <Input
                                    id="inquiry-phone"
                                    type="tel"
                                    placeholder="+94 77 123 4567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inquiry-message">Message *</Label>
                            <Textarea
                                id="inquiry-message"
                                placeholder="I'm interested in this property..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={4}
                                disabled={isPending}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            disabled={isPending || !name || !message}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Inquiry
                                </>
                            )}
                        </Button>

                        <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground pt-2">
                            <Lock className="w-3 h-3 text-emerald-600/70" />
                            <span>Your privacy is protected. We never share your data.</span>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
