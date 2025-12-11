import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, createSessionClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query } from "node-appwrite"
import { Building2, CheckCircle, Eye, Heart, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const { databases } = await createSessionClient()

    // Fetch real statistics
    let totalListings = 0
    let activeListings = 0
    let totalViews = 0
    let favoritesCount = 0
    let recentProperties: any[] = []

    try {
        // Total listings by this user
        const allProperties = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [Query.equal('user_id', user.$id)]
        )
        totalListings = allProperties.total

        // Active listings only
        const activeProps = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('user_id', user.$id),
                Query.equal('status', 'active')
            ]
        )
        activeListings = activeProps.total

        // Sum of all views across user's properties
        totalViews = allProperties.documents.reduce((sum, p) => sum + (p.views || 0), 0)

        // User's saved/favorited properties
        const favorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [Query.equal('user_id', user.$id)]
        )
        favoritesCount = favorites.total

        // Recent properties for activity
        const recent = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('user_id', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(5)
            ]
        )
        recentProperties = recent.documents.map(doc => ({
            id: doc.$id,
            title: doc.title,
            status: doc.status,
            created_at: doc.$createdAt,
            views: doc.views || 0,
        }))
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalListings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Properties you've posted
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{activeListings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently live listings
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all your properties
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
                        <Heart className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{favoritesCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Properties you've saved
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentProperties && recentProperties.length > 0 ? (
                            <div className="space-y-4">
                                {recentProperties.map((property) => (
                                    <Link
                                        key={property.id}
                                        href={`/properties/${property.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{property.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(property.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${property.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : property.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {property.status}
                                            </span>
                                            <span className="flex items-center text-sm text-muted-foreground">
                                                <Eye className="w-3 h-3 mr-1" />
                                                {property.views || 0}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">No listings yet.</p>
                                <Link href="/dashboard/post-ad" className="text-emerald-600 hover:underline text-sm">
                                    Create your first listing →
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            href="/dashboard/post-ad"
                            className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-700 dark:text-emerald-400"
                        >
                            <Building2 className="h-5 w-5" />
                            <span className="font-medium">Post New Ad</span>
                        </Link>
                        <Link
                            href="/dashboard/my-ads"
                            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-400"
                        >
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Manage Listings</span>
                        </Link>
                        <Link
                            href="/dashboard/favorites"
                            className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-700 dark:text-red-400"
                        >
                            <Heart className="h-5 w-5" />
                            <span className="font-medium">View Favorites</span>
                        </Link>
                        <Link
                            href="/search"
                            className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-purple-700 dark:text-purple-400"
                        >
                            <Eye className="h-5 w-5" />
                            <span className="font-medium">Browse Properties</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
