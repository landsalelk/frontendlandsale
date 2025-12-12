"use client"

import { useState } from 'react'
import { PostAdForm } from "@/components/features/dashboard/PostAdForm"
import { AIPropertyPost } from "@/components/features/ai/ai-property-post"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, PenTool } from 'lucide-react'

export default function PostAdPage() {
    const [mode, setMode] = useState<'manual' | 'ai'>('manual')

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Post a New Ad</h1>
                <p className="text-muted-foreground">
                    Choose how you want to create your property listing
                </p>
            </div>

            {/* Mode Selection */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Choose Your Listing Method</CardTitle>
                    <CardDescription>
                        Use our AI assistant for quick creation or fill out the form manually
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            variant={mode === 'manual' ? 'default' : 'outline'}
                            onClick={() => setMode('manual')}
                            className="flex items-center gap-2"
                        >
                            <PenTool className="h-4 w-4" />
                            Manual Form
                        </Button>
                        <Button
                            variant={mode === 'ai' ? 'default' : 'outline'}
                            onClick={() => setMode('ai')}
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            AI Assistant
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Content based on selected mode */}
            {mode === 'manual' ? (
                <PostAdForm />
            ) : (
                <AIPropertyPost />
            )}
        </div>
    )
}