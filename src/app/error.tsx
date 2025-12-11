'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Application Error:', error)
        }
        // TODO: Log to error monitoring service (Sentry, LogRocket, etc.)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Don't worry, your data is safe.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                            <p className="text-sm font-mono text-red-700 dark:text-red-400">
                                {error.message}
                            </p>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={reset}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            asChild
                        >
                            <Link href="/">Return Home</Link>
                        </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        If this problem persists, please contact support.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
