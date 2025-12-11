import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)}
            {...props}
        />
    )
}

// Property Card Skeleton
function PropertyCardSkeleton() {
    return (
        <div className="rounded-xl border bg-white dark:bg-slate-950 overflow-hidden">
            {/* Image placeholder */}
            <Skeleton className="aspect-[4/3] w-full rounded-none" />

            <div className="p-4 space-y-3">
                {/* Type badge */}
                <Skeleton className="h-5 w-16 rounded-full" />

                {/* Title */}
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />

                {/* Location */}
                <Skeleton className="h-4 w-1/2" />

                {/* Features */}
                <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                </div>

                {/* Price */}
                <Skeleton className="h-8 w-32 mt-4" />
            </div>
        </div>
    )
}

// Property Grid Skeleton
function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
            ))}
        </div>
    )
}

// Dashboard Stats Skeleton
function DashboardStatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-6 space-y-3">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    )
}

// Inquiry Card Skeleton
function InquiryCardSkeleton() {
    return (
        <div className="rounded-xl border p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
        </div>
    )
}

export {
    Skeleton,
    PropertyCardSkeleton,
    PropertyGridSkeleton,
    DashboardStatsSkeleton,
    InquiryCardSkeleton
}
