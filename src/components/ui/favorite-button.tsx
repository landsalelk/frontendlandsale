"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleFavorite } from "@/lib/actions/favorites"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface FavoriteButtonProps {
    propertyId: string
    initialFavorited?: boolean
    variant?: "icon" | "default"
    className?: string
}

export function FavoriteButton({
    propertyId,
    initialFavorited = false,
    variant = "icon",
    className
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleFavorite(propertyId)

            if (result.error) {
                // If not logged in, redirect to login
                if (result.error.includes("logged in")) {
                    toast.info("Sign in to save favorites", {
                        description: "Create an account or log in to save properties you love.",
                        action: {
                            label: "Sign In",
                            onClick: () => router.push("/auth/login")
                        }
                    })
                    return
                }
                
                // Handle specific error types
                if (result.error.includes("network") || result.error.includes("connection")) {
                    toast.error("Connection lost", {
                        description: "Please check your internet connection and try again."
                    })
                } else if (result.error.includes("timeout")) {
                    toast.error("Request timed out", {
                        description: "The request is taking too long. Please try again."
                    })
                } else {
                    toast.error("Couldn't update favorites", {
                        description: result.error
                    })
                }
                return
            }

            if (result.success && result.isFavorited !== undefined) {
                setIsFavorited(result.isFavorited)
                if (result.isFavorited) {
                    toast.success("Added to favorites", {
                        description: "View all favorites in your dashboard"
                    })
                } else {
                    toast.success("Removed from favorites")
                }
            }
        })
    }

    if (variant === "icon") {
        return (
            <Button
                variant="outline"
                size="icon"
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                    "group transition-all duration-200 hover:scale-105 active:scale-95",
                    isFavorited && "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800",
                    className
                )}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
                <Heart
                    className={cn(
                        "h-4 w-4 transition-all duration-300 ease-out",
                        isFavorited && "fill-red-500 text-red-500 scale-110",
                        isPending && "animate-pulse",
                        !isFavorited && "hover:scale-110 group-hover:text-red-400"
                    )}
                />
            </Button>
        )
    }

    return (
        <Button
            variant={isFavorited ? "destructive" : "outline"}
            onClick={handleToggle}
            disabled={isPending}
            className={cn(className)}
        >
            <Heart
                className={cn(
                    "h-4 w-4 mr-2 transition-all",
                    isFavorited && "fill-current",
                    isPending && "animate-pulse"
                )}
            />
            {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
    )
}
