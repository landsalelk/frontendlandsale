"use client"

import { Button } from "@/components/ui/button"
import { seedProperties } from "@/lib/actions/seed"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SeedPage() {
    const [status, setStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSeed = async () => {
        setLoading(true)
        setStatus(null)
        try {
            const result = await seedProperties()
            if (result.error) {
                setStatus(`Error: ${result.error}`)
            } else {
                setStatus(`Success! Added ${result.count} properties.`)
            }
        } catch (e: any) {
            setStatus(`Unexpected error: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-20 flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-3xl font-bold mb-8">Database Seeder</h1>

            <p className="mb-8 text-muted-foreground text-center max-w-md">
                This tool inserts 6 mock properties into the database linked to your current account.
            </p>

            {status && (
                <Alert className="mb-6 max-w-md" variant={status.startsWith("Error") ? "destructive" : "default"}>
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <Button onClick={handleSeed} disabled={loading} size="lg">
                {loading ? "Seeding..." : "Seed Database"}
            </Button>
        </div>
    )
}
