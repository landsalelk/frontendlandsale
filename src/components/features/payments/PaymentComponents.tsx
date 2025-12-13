"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, ShieldCheck, Crown, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

interface BoostOptions {
    propertyId: string
    propertyTitle: string
    userId: string
    userEmail: string
    userName: string
    userPhone?: string
}

const BOOST_PLANS = [
    {
        id: "boost_weekly",
        name: "Weekly Boost",
        price: 500,
        duration: "7 days",
        features: ["Top of search results", "Highlighted listing", "2x more views"],
        popular: false
    },
    {
        id: "boost_monthly",
        name: "Monthly Boost",
        price: 1500,
        duration: "30 days",
        features: ["Top of search results", "Highlighted listing", "Featured on homepage", "5x more views"],
        popular: true
    }
]

export function BoostPaymentModal({ propertyId, propertyTitle, userId, userEmail, userName, userPhone }: BoostOptions) {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handlePurchase = async (planId: string) => {
        setIsLoading(planId)

        try {
            const orderId = `BOOST_${propertyId}_${Date.now()}`

            const response = await fetch("/api/payments/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: planId,
                    orderId,
                    userId,
                    userEmail,
                    userName,
                    userPhone,
                    propertyId
                })
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to initiate payment")
            }

            // Create and submit PayHere form
            const form = document.createElement("form")
            form.method = "POST"
            form.action = data.checkoutUrl

            Object.entries(data.paymentData).forEach(([key, value]) => {
                const input = document.createElement("input")
                input.type = "hidden"
                input.name = key
                input.value = String(value)
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()

        } catch (error: any) {
            toast.error("Payment Error", { description: error.message })
            setIsLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Boost Your Listing</h2>
                <p className="text-muted-foreground mt-2">
                    Get more views and sell faster with a boosted listing
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {BOOST_PLANS.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative transition-all hover:shadow-lg ${plan.popular ? "border-orange-500 border-2" : ""
                            }`}
                    >
                        {plan.popular && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500">
                                Most Popular
                            </Badge>
                        )}
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>{plan.duration}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold mb-4">
                                Rs. {plan.price.toLocaleString()}
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className={`w-full ${plan.popular ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" : ""}`}
                                onClick={() => handlePurchase(plan.id)}
                                disabled={isLoading !== null}
                            >
                                {isLoading === plan.id ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    "Get Started"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by PayHere. Your listing will be boosted immediately after payment.
            </p>
        </div>
    )
}

export function VerifyPaymentButton({ propertyId, userId, userEmail, userName, userPhone }: Omit<BoostOptions, 'propertyTitle'>) {
    const [isLoading, setIsLoading] = useState(false)

    const handleVerify = async () => {
        setIsLoading(true)

        try {
            const orderId = `VERIFY_${propertyId}_${Date.now()}`

            const response = await fetch("/api/payments/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: "verified_badge",
                    orderId,
                    userId,
                    userEmail,
                    userName,
                    userPhone,
                    propertyId
                })
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to initiate payment")
            }

            // Redirect to PayHere
            const form = document.createElement("form")
            form.method = "POST"
            form.action = data.checkoutUrl

            Object.entries(data.paymentData).forEach(([key, value]) => {
                const input = document.createElement("input")
                input.type = "hidden"
                input.name = key
                input.value = String(value)
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()

        } catch (error: any) {
            toast.error("Payment Error", { description: error.message })
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleVerify}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
            {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
                <><ShieldCheck className="w-4 h-4 mr-2" /> Get Verified (Rs. 1,500)</>
            )}
        </Button>
    )
}
