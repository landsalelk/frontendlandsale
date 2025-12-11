import { Skeleton } from '@/components/ui/skeleton'

export default function PropertyLoading() {
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="aspect-video w-full rounded-lg" />
                            ))}
                        </div>
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-8 w-1/3" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Agent Card Skeleton */}
                    <Skeleton className="h-64 w-full rounded-xl" />

                    {/* Contact Actions Skeleton */}
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
