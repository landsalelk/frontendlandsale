import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Your payment was cancelled. No charges were made to your account.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href="/dashboard/my-ads">Back to My Listings</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/contact">Need Help?</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
