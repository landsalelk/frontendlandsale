import { getCurrentUser } from "@/lib/appwrite/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Eye,
    Heart,
    MessageSquare,
    TrendingUp,
    Building2,
    CheckCircle,
    Clock,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import Link from "next/link"
import { getDashboardStats, getPropertyAnalytics } from "@/lib/actions/analytics"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const stats = await getDashboardStats()
    const propertyAnalytics = await getPropertyAnalytics()

    // Calculate engagement rate (inquiries / views * 100)
    const engagementRate = stats.totalViews > 0
        ? ((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)
        : '0'

    // Calculate save rate (favorites / views * 100)
    const saveRate = stats.totalViews > 0
        ? ((stats.totalFavorites / stats.totalViews) * 100).toFixed(1)
        : '0'

    // Find best performing property
    const bestProperty = propertyAnalytics.length > 0
        ? propertyAnalytics.reduce((best, current) =>
            (current.views + current.inquiries * 10) > (best.views + best.inquiries * 10)
                ? current
                : best
        )
        : null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-emerald-600" />
                    Analytics
                </h1>
                <p className="text-muted-foreground">
                    Track your property performance and buyer engagement.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all your properties
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saved by Buyers</CardTitle>
                        <Heart className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.totalFavorites}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {saveRate}% save rate
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {stats.totalInquiries}
                            {stats.unreadInquiries > 0 && (
                                <Badge className="ml-2 bg-emerald-600">{stats.unreadInquiries} new</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {engagementRate}% conversion rate
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Listing Status</CardTitle>
                        <Building2 className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProperties}</div>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {stats.activeListings} active
                            </Badge>
                            {stats.pendingListings > 0 && (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {stats.pendingListings} pending
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Engagement Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Engagement Metrics
                        </CardTitle>
                        <CardDescription>How buyers interact with your listings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Conversion Rate (Views → Inquiries)</span>
                                <span className="font-medium">{engagementRate}%</span>
                            </div>
                            <Progress value={parseFloat(engagementRate)} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {parseFloat(engagementRate) >= 5 ? (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" /> Above average
                                    </span>
                                ) : (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <ArrowDownRight className="w-3 h-3" /> Below 5% benchmark
                                    </span>
                                )}
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Save Rate (Views → Favorites)</span>
                                <span className="font-medium">{saveRate}%</span>
                            </div>
                            <Progress value={parseFloat(saveRate)} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {parseFloat(saveRate) >= 3 ? (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" /> Good engagement
                                    </span>
                                ) : (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <ArrowDownRight className="w-3 h-3" /> Consider adding more photos
                                    </span>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {bestProperty && (
                    <Card className="border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                🏆 Top Performing Property
                            </CardTitle>
                            <CardDescription>Your best listing this period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={`/properties/${bestProperty.propertyId}`}
                                className="block p-4 rounded-lg bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <h3 className="font-semibold mb-3 line-clamp-2">{bestProperty.title}</h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">{bestProperty.views}</p>
                                        <p className="text-xs text-muted-foreground">Views</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-500">{bestProperty.favorites}</p>
                                        <p className="text-xs text-muted-foreground">Saves</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-emerald-600">{bestProperty.inquiries}</p>
                                        <p className="text-xs text-muted-foreground">Inquiries</p>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Property Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Property Performance</CardTitle>
                    <CardDescription>Detailed view of each property's metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    {propertyAnalytics.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">No properties yet</p>
                            <Link href="/dashboard/post-ad" className="text-emerald-600 hover:underline text-sm">
                                Post your first ad →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 font-medium">Property</th>
                                        <th className="pb-3 font-medium text-center">Status</th>
                                        <th className="pb-3 font-medium text-center">Views</th>
                                        <th className="pb-3 font-medium text-center">Saves</th>
                                        <th className="pb-3 font-medium text-center">Inquiries</th>
                                        <th className="pb-3 font-medium text-center">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {propertyAnalytics.map((prop) => {
                                        const score = prop.views + (prop.inquiries * 10) + (prop.favorites * 5)
                                        const maxScore = Math.max(...propertyAnalytics.map(p => p.views + p.inquiries * 10 + p.favorites * 5))
                                        const scorePercent = maxScore > 0 ? (score / maxScore) * 100 : 0

                                        return (
                                            <tr key={prop.propertyId} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                <td className="py-4">
                                                    <Link
                                                        href={`/properties/${prop.propertyId}`}
                                                        className="font-medium hover:text-emerald-600 transition-colors line-clamp-1 max-w-[200px]"
                                                    >
                                                        {prop.title}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(prop.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <Badge variant={prop.status === 'active' ? 'default' : 'secondary'} className={
                                                        prop.status === 'active'
                                                            ? 'bg-emerald-600'
                                                            : prop.status === 'pending'
                                                                ? 'bg-amber-500'
                                                                : ''
                                                    }>
                                                        {prop.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <Eye className="w-4 h-4 text-blue-500" />
                                                        {prop.views}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <Heart className="w-4 h-4 text-red-500" />
                                                        {prop.favorites}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                                                        {prop.inquiries}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={scorePercent} className="h-2 w-16" />
                                                        <span className="text-xs text-muted-foreground">{score}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border-emerald-200/50">
                <CardHeader>
                    <CardTitle className="text-lg">💡 Tips to Improve Your Listings</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Add at least 5 high-quality photos to increase engagement by up to 200%</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Include key features like water, electricity, and road access in your description</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Respond to inquiries within 24 hours to improve conversion rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>Price competitively by researching similar properties in your area</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
