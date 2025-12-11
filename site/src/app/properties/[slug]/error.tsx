'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function PropertyError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Property Page Error:', error)
        }
    }, [error])

    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-lg mx-auto">
                <CardHeader className="text-center">
                    <CardTitle>Unable to Load Property</CardTitle>
                    <CardDescription>
                        We couldn't load this property listing. It may have been removed or there was a connection error.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Button onClick={reset} className="w-full">
                            Try Again
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/search">
                                <Search className="mr-2 h-4 w-4" />
                                Browse Properties
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
