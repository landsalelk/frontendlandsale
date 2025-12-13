"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Action {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

interface EmptyStateProps {
    icon?: LucideIcon | React.ElementType;
    title: string;
    description: string;
    action?: Action;
    secondaryAction?: Action;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 ${className}`}>
            {Icon && (
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-4 ring-white dark:ring-slate-950 shadow-sm">
                    <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
            )}

            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>

            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400 mb-8 mx-auto leading-relaxed">
                {description}
            </p>

            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {action && (
                        <Button onClick={action.onClick} variant={action.variant || "default"}>
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button onClick={secondaryAction.onClick} variant={secondaryAction.variant || "outline"}>
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

