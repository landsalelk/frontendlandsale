"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerifiedBadgeProps {
    variant?: 'default' | 'large' | 'inline'
    className?: string
}

export function VerifiedBadge({ variant = 'default', className }: VerifiedBadgeProps) {
    const Badge = () => (
        <div className={cn(
            "inline-flex items-center gap-1.5 font-semibold rounded-full transition-all",
            variant === 'default' && "bg-emerald-100/80 text-emerald-700 px-2.5 py-1 text-xs",
            variant === 'large' && "bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-sm shadow-lg shadow-emerald-500/20",
            variant === 'inline' && "text-emerald-600 text-xs",
            className
        )}>
            <ShieldCheck className={cn(
                variant === 'large' ? "w-5 h-5" : "w-4 h-4"
            )} />
            <span>Verified</span>
        </div>
    )

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help"><Badge /></span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-center bg-white dark:bg-slate-900 border border-emerald-200 shadow-xl">
                    <p className="text-xs font-medium text-emerald-700">Verified by Landsale.lk</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        This property's title deeds have been checked by our team.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
