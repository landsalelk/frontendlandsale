import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Thank you for your purchase. Your listing will be updated shortly.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href="/dashboard/my-ads">View My Listings</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Go to Homepage</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
