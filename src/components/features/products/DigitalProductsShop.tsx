"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Lock, Download, Eye, FileText, Image, MapPin } from "lucide-react"
import { toast } from "sonner"

interface DigitalProduct {
    id: string
    property_id: string
    type: string
    name: string
    description: string
    price: number
    icon: string
    is_available: boolean
}

interface DigitalProductsShopProps {
    propertyId: string
    propertyTitle: string
    products: DigitalProduct[]
    userId?: string
    userEmail?: string
    userName?: string
}

export function DigitalProductsShop({
    propertyId,
    propertyTitle,
    products,
    userId,
    userEmail,
    userName
}: DigitalProductsShopProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handlePurchase = async (product: DigitalProduct) => {
        if (!userId) {
            toast.error("Please login to purchase", { description: "You need an account to buy digital products" })
            return
        }

        setIsLoading(product.id)

        try {
            const orderId = `DIGITAL_${product.type.toUpperCase()}_${propertyId}_${Date.now()}`

            const response = await fetch("/api/payments/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: "digital_product",
                    orderId,
                    userId,
                    userEmail,
                    userName,
                    propertyId,
                    // Custom data for the product
                    customAmount: product.price,
                    customName: product.name
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
            setIsLoading(null)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'investment_report':
            case 'valuation_report':
                return <FileText className="w-8 h-8" />
            case 'blueprint':
                return <MapPin className="w-8 h-8" />
            case 'raw_images':
                return <Image className="w-8 h-8" />
            default:
                return <FileText className="w-8 h-8" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold">Premium Digital Products</h3>
                <p className="text-muted-foreground mt-1">
                    Unlock detailed reports and exclusive content for "{propertyTitle}"
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {products.map((product) => (
                    <Card
                        key={product.id}
                        className="relative overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                        <div className="absolute top-0 right-0 p-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                <Lock className="w-3 h-3 mr-1" /> Premium
                            </Badge>
                        </div>

                        <CardHeader className="pb-2">
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl text-purple-600">
                                    {getIcon(product.type)}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-base">{product.name}</CardTitle>
                                    <CardDescription className="text-xs mt-1 line-clamp-2">
                                        {product.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-2">
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-purple-600">
                                    Rs. {product.price.toLocaleString()}
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                    onClick={() => handlePurchase(product)}
                                    disabled={isLoading !== null}
                                >
                                    {isLoading === product.id ? (
                                        <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing</>
                                    ) : (
                                        <>Buy Now</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                    🔒 All purchases are secured by PayHere. Instant delivery after payment.
                </p>
            </div>
        </div>
    )
}

// Preview button for property cards
export function DigitalProductsBadge({ propertyId }: { propertyId: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 border-purple-300 text-purple-700"
                >
                    <Lock className="w-3 h-3 mr-1" /> Premium Content
                </Badge>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Premium Digital Products</DialogTitle>
                </DialogHeader>
                <div className="text-center py-8 text-muted-foreground">
                    <p>Loading products...</p>
                    <p className="text-sm mt-2">View the property details to see available products.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
