"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    TrendingUp,
    Eye,
    MousePointerClick,
    Heart,
    Phone,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Search,
    BarChart3,
    Smartphone
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn, formatPrice } from "@/lib/utils"
// Import Property interface from shared location or redefine to match exactly
// In this file we redefine it to be flexible but match what we expect
interface Property {
    id: string
    title: string
    price: number
    views?: number
    images?: string[]
    description?: string
    // add other fields as needed
}

interface AdHealthDashboardProps {
    property: Property
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdHealthDashboard({ property, open, onOpenChange }: AdHealthDashboardProps) {
    const [activeTab, setActiveTab] = useState("overview")

    // Mock data - in real app, fetch this based on property.id
    const stats = {
        impressions: property.views || 450,
        clicks: Math.floor((property.views || 450) * 0.12),
        saves: 15, // "Silent Admirers"
        calls: 2,
        ctr: "12%",
        daysActive: 12
    }

    const priceHealth = {
        status: "high", // low, good, high
        marketAverage: property.price * 0.85,
        difference: "+15%"
    }

    // Dynamic Ad Quality Calculation
    const adQuality = useMemo(() => {
        let score = 50
        const issues = []

        // Image Check (Target: 5 images)
        const imageCount = property.images?.length || 0
        if (imageCount < 3) {
            issues.push({ id: 1, text: `Add ${3 - imageCount} more photos (High Impact)`, impact: "high" })
        } else {
            score += 20
        }
        if (imageCount >= 5) score += 10

        // Description Check (Target: 100 chars)
        const descLength = property.description?.length || 0
        if (descLength < 50) {
            issues.push({ id: 2, text: "Description is too short (Medium Impact)", impact: "medium" })
        } else {
            score += 15
        }
        if (descLength > 150) score += 5

        // Cap score at 100
        score = Math.min(100, score)

        return { score, issues }
    }, [property.images, property.description])

    // Mock graph data (Last 7 days)
    const graphData = [
        { day: 'Mon', views: 45 },
        { day: 'Tue', views: 52 },
        { day: 'Wed', views: 38 },
        { day: 'Thu', views: 65 },
        { day: 'Fri', views: 48 },
        { day: 'Sat', views: 90 },
        { day: 'Sun', views: 75 },
    ]

    const maxViews = Math.max(...graphData.map(d => d.views))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50">

                {/* Header */}
                <div className="p-6 border-b border-border/50 flex justify-between items-start bg-muted/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <TrendingUp className="w-3 h-3 mr-1" /> Live Analytics
                            </Badge>
                            <span className="text-xs text-muted-foreground">Last updated: Just now</span>
                        </div>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Ad Health: {property.title}
                        </DialogTitle>
                    </div>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="diagnostics">Diagnostics & Fixes</TabsTrigger>
                            <TabsTrigger value="boost">Boost & Optimize</TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="mt-0 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                                >
                                    <StatCard
                                        icon={Eye}
                                        label="Total Impressions"
                                        value={stats.impressions}
                                        trend="+12% this week"
                                        color="text-blue-500"
                                        bg="bg-blue-500/10"
                                    />
                                    <StatCard
                                        icon={MousePointerClick}
                                        label="Clicks (Detail Views)"
                                        value={stats.clicks}
                                        trend={`${stats.ctr} CTR`}
                                        color="text-purple-500"
                                        bg="bg-purple-500/10"
                                    />
                                    <StatCard
                                        icon={Heart}
                                        label="Silent Admirers (Saves)"
                                        value={stats.saves}
                                        trend="Waiting to call..."
                                        color="text-pink-500"
                                        bg="bg-pink-500/10"
                                    />
                                    <StatCard
                                        icon={Phone}
                                        label="Direct Inquiries"
                                        value={stats.calls}
                                        trend="Needs improvement"
                                        color="text-orange-500"
                                        bg="bg-orange-500/10"
                                        alert={stats.calls === 0}
                                    />
                                </motion.div>

                                {/* Activity Graph */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
                                >
                                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                                        Performance (Last 7 Days)
                                    </h3>
                                    <div className="h-64 flex items-end justify-between gap-2">
                                        {graphData.map((d, i) => (
                                            <div key={d.day} className="flex flex-col items-center gap-2 flex-1 group">
                                                <div className="relative w-full flex justify-end flex-col items-center h-full">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-foreground text-background text-xs px-2 py-1 rounded">
                                                        {d.views} views
                                                    </div>
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${(d.views / maxViews) * 100}%` }}
                                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                                        className="w-full max-w-[40px] bg-primary/20 hover:bg-primary/80 rounded-t-sm transition-all duration-300 relative overflow-hidden"
                                                    >
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50" />
                                                    </motion.div>
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground flex items-start gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Insight:</p>
                                            <p>Your ad gets the most attention on <strong>weekends</strong>. Consider boosting your post on Friday evenings.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </TabsContent>

                            {/* DIAGNOSTICS TAB */}
                            <TabsContent value="diagnostics" className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="grid md:grid-cols-2 gap-6"
                                >
                                    {/* Price Health */}
                                    <div className="border border-border/50 rounded-xl p-6 bg-card">
                                        <h3 className="font-semibold text-lg mb-4">Price Health</h3>
                                        <div className="relative pt-6 pb-2">
                                            <div className="h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full w-full opacity-20" />
                                            <div className="absolute top-6 left-0 right-0 h-4 flex items-center px-1">
                                                {/* Indicator */}
                                                <motion.div
                                                    initial={{ left: "50%" }}
                                                    animate={{ left: "85%" }} // Simulated high price
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="absolute w-4 h-8 bg-foreground border-2 border-background rounded-full shadow-lg -translate-x-1/2"
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                                                <span>Great Deal</span>
                                                <span>Fair Price</span>
                                                <span>Expensive</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <h4 className="text-red-600 font-semibold flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Priced {priceHealth.difference} above average
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Properties in this area usually sell for around <span className="font-mono font-medium">{formatPrice(priceHealth.marketAverage)}</span>. High price might be scaring away buyers.
                                            </p>
                                            <Button size="sm" variant="outline" className="mt-3 w-full border-red-200 hover:bg-red-50 text-red-700">
                                                Adjust Price
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Ad Quality */}
                                    <div className="border border-border/50 rounded-xl p-6 bg-card">
                                        <h3 className="font-semibold text-lg mb-4">Ad Quality Score</h3>
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-24 h-24 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                                                    <motion.circle
                                                        cx="48" cy="48" r="40"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="transparent"
                                                        strokeDasharray={251.2}
                                                        strokeDashoffset={251.2 * (1 - adQuality.score / 100)} // Calculate offset
                                                        className={cn(
                                                            adQuality.score > 70 ? "text-green-500" : adQuality.score > 40 ? "text-yellow-500" : "text-red-500"
                                                        )}
                                                        initial={{ strokeDashoffset: 251.2 }}
                                                        animate={{ strokeDashoffset: 251.2 * (1 - adQuality.score / 100) }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                    />
                                                </svg>
                                                <div className="absolute text-2xl font-bold">{adQuality.score}</div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                {adQuality.issues.length === 0 && (
                                                    <div className="flex items-start gap-2 text-sm text-green-600">
                                                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                                        <span>Great job! Your ad looks perfect.</span>
                                                    </div>
                                                )}
                                                {adQuality.issues.map(issue => (
                                                    <div key={issue.id} className="flex items-start gap-2 text-sm">
                                                        <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                                        <span>{issue.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <Button className="w-full mt-6">Fix Issues & Improve Score</Button>
                                    </div>
                                </motion.div>
                            </TabsContent>

                            {/* BOOST TAB */}
                            <TabsContent value="boost">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4">
                                            <TrendingUp className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold">Boost Your Listing</h3>
                                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                            Get more views and sell faster with a boosted listing
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="border border-border rounded-xl p-6 hover:border-orange-300 transition-colors">
                                            <h4 className="font-semibold text-lg">Weekly Boost</h4>
                                            <p className="text-sm text-muted-foreground mb-4">7 days visibility</p>
                                            <div className="text-3xl font-bold text-orange-600 mb-4">Rs. 500</div>
                                            <ul className="text-sm space-y-2 mb-6">
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Top of search results</li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 2x more views</li>
                                            </ul>
                                            <Button className="w-full" variant="outline" onClick={() => window.location.href = `/dashboard/boost/${property.id}?plan=weekly`}>
                                                Select Weekly
                                            </Button>
                                        </div>

                                        <div className="border-2 border-orange-500 rounded-xl p-6 relative bg-orange-50/50 dark:bg-orange-950/10">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                Best Value
                                            </div>
                                            <h4 className="font-semibold text-lg">Monthly Boost</h4>
                                            <p className="text-sm text-muted-foreground mb-4">30 days visibility</p>
                                            <div className="text-3xl font-bold text-orange-600 mb-4">Rs. 1,500</div>
                                            <ul className="text-sm space-y-2 mb-6">
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Top of search results</li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Featured on homepage</li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 5x more views</li>
                                            </ul>
                                            <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => window.location.href = `/dashboard/boost/${property.id}?plan=monthly`}>
                                                Select Monthly
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-center text-muted-foreground">
                                        Secure payment powered by PayHere 🔒
                                    </p>
                                </div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>

                <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between gap-2">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={async () => {
                        const { toast } = await import("sonner")
                        toast.info("Sending report...", { description: "This will use Appwrite Messaging once configured." })
                    }}>
                        <Smartphone className="w-4 h-4 mr-2" /> Send to Phone
                    </Button>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        <Button onClick={() => setActiveTab('diagnostics')} className="gap-2">
                            Take Action <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function StatCard({ icon: Icon, label, value, trend, color, bg, alert }: any) {
    return (
        <div className={cn("p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-colors", alert && "border-red-500/50 bg-red-500/5")}>
            <div className="flex justify-between items-start mb-2">
                <div className={cn("p-2 rounded-lg", bg, color)}>
                    <Icon className="w-5 h-5" />
                </div>
                {alert && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <div className="font-bold text-2xl text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground truncate">{label}</div>
            <div className={cn("text-xs font-medium mt-2", alert ? "text-red-500" : "text-emerald-500")}>
                {trend}
            </div>
        </div>
    )
}
