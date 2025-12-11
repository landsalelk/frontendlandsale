import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Search className="h-12 w-12 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl">Property Not Found</CardTitle>
          <CardDescription>
            The property you&apos;re looking for doesn&apos;t exist or may have been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              asChild
            >
              <Link href="/properties">
                <Search className="mr-2 h-4 w-4" />
                Browse Properties
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}