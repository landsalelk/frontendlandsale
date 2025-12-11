"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const themes = [
    { value: "light", label: "Light", icon: Sun, description: "Light theme for daytime use" },
    { value: "dark", label: "Dark", icon: Moon, description: "Dark theme for reduced eye strain" },
    { value: "system", label: "System", icon: Monitor, description: "Follow your system preference" },
] as const

export function AppearanceForm() {
    const { theme, setTheme } = useTheme()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize how the dashboard looks for you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themes.map((t) => {
                            const Icon = t.icon
                            const isSelected = theme === t.value
                            return (
                                <Button
                                    key={t.value}
                                    variant="outline"
                                    onClick={() => setTheme(t.value)}
                                    className={cn(
                                        "h-auto flex-col items-start p-4 relative",
                                        isSelected && "border-emerald-600 ring-2 ring-emerald-600/20"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="h-4 w-4 text-emerald-600" />
                                        </div>
                                    )}
                                    <Icon className={cn(
                                        "h-6 w-6 mb-2",
                                        isSelected ? "text-emerald-600" : "text-muted-foreground"
                                    )} />
                                    <span className="font-semibold">{t.label}</span>
                                    <span className="text-xs text-muted-foreground text-left mt-1">
                                        {t.description}
                                    </span>
                                </Button>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600" />
                            <div>
                                <div className="h-3 w-24 bg-foreground/20 rounded" />
                                <div className="h-2 w-16 bg-muted-foreground/30 rounded mt-1.5" />
                            </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded" />
                        <div className="h-2 w-3/4 bg-muted rounded mt-2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
