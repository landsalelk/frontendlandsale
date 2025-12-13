import { getCurrentUser, createSessionClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { transformListingToProperty } from "@/lib/utils"
import { DashboardPropertyCard } from "@/components/features/dashboard/DashboardPropertyCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, AlertCircle } from "lucide-react"
import { Query } from "node-appwrite"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function MyAdsPage() {
    const user = await getCurrentUser()

    if (!user) return <div>Please login</div>

    let properties: any[] = []
    let error: any = null

    try {
        const { databases } = await createSessionClient()
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('user_id', user.$id),
                Query.orderDesc('$createdAt')
            ]
        )
        properties = response.documents.map((listing: any) => {
            try {
                return transformListingToProperty(listing)
            } catch (error) {
                console.error("Error transforming listing:", error)
                return listing
            }
        })
    } catch (e) {
        console.error("Error fetching properties:", e)
        error = e
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
                    <p className="text-muted-foreground">
                        Manage your active and inactive property listings.
                    </p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/dashboard/post-ad">
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Ad
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                        <h3 className="font-medium">Failed to load properties</h3>
                        <p className="text-sm opacity-90">Please refresh the page later.</p>
                    </div>
                </div>
            )}

            {!error && properties?.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <Plus className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first property listing today.</p>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/post-ad">Post Ad</Link>
                    </Button>
                </div>
            )}

            <div className="grid gap-4">
                {properties?.map((property) => (
                    <DashboardPropertyCard key={property.$id} property={property} />
                ))}
            </div>
        </div>
    )
}
