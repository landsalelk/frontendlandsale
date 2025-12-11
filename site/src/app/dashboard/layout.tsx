import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/appwrite/server"
import { clearInvalidSession } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, List, Heart, Settings, LogOut, MessageSquare, BarChart3 } from "lucide-react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let user = null
    
    try {
        user = await getCurrentUser()
    } catch (error) {
        console.error("Failed to get current user:", error)
        // Clear any invalid session cookie
        await clearInvalidSession()
        redirect("/login")
    }

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
            <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                <div className="h-full py-6 pr-6 lg:py-8">
                    <div className="flex flex-col gap-2">
                        <Button variant="secondary" className="justify-start" asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Overview
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/dashboard/post-ad">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Post Ad
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/dashboard/my-ads">
                                <List className="mr-2 h-4 w-4" />
                                My Listings
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/dashboard/analytics">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analytics
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/dashboard/favorites">
                                <Heart className="mr-2 h-4 w-4" />
                                Favorites
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/dashboard/inquiries">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Inquiries
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    </div>
                </div>
            </aside>
            <main className="flex w-full flex-col overflow-hidden">{children}</main>
        </div>
    )
}
