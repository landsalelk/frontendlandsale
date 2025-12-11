import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function MyAdsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <Button disabled className="bg-emerald-600/50 opacity-50 cursor-not-allowed">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Ad
                </Button>
            </div>

            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4 bg-card">
                        <Skeleton className="w-full sm:w-48 aspect-video sm:aspect-square rounded-md shrink-0" />
                        <div className="flex-1 space-y-4 py-1">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
