import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar Skeleton - Hidden on mobile, visible on md+ */}
                <aside className="hidden md:block w-72 shrink-0 space-y-6 border rounded-xl p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24 mb-4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </aside>

                {/* Results Grid Skeleton */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        {/* Mobile Filter Button Skeleton */}
                        <Skeleton className="h-10 w-full sm:w-32 md:hidden" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-xl border bg-card text-card-foreground shadow space-y-0 overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-5 w-2/3" />
                                    </div>
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex gap-2 pt-2">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                    <div className="pt-2 flex justify-between items-center border-t mt-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
