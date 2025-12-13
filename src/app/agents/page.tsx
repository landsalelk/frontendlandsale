import { Metadata } from "next"
import { AgentRegistrationForm } from "@/components/features/agents/AgentRegistrationForm"
import { AgentCard, Agent } from "@/components/features/agents/AgentCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react"

export const metadata: Metadata = {
    title: "Become an Agent | Landsale.lk",
    description: "Join Landsale.lk as a verified property agent. Get exclusive leads in your area. Free to join, no hidden fees.",
}

// Mock agents for display
const FEATURED_AGENTS: Agent[] = [
    {
        id: "1",
        name: "Chaminda Perera",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        phone: "0771234567",
        whatsapp: "94771234567",
        bio: "Specializing in residential land sales in Gampaha district for over 15 years. Known for transparent dealings.",
        experience: 15,
        serviceAreas: ["Gampaha", "Kelaniya", "Wattala", "Ja-Ela"],
        specializations: ["Residential Land", "Commercial Property"],
        rating: 4.8,
        reviewCount: 42,
        dealsCount: 156,
        isVerified: true
    },
    {
        id: "2",
        name: "Nimal Jayawardena",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        phone: "0779876543",
        whatsapp: "94779876543",
        bio: "Tea estate and hill country property specialist. Helping investors find the best deals in Nuwara Eliya.",
        experience: 8,
        serviceAreas: ["Nuwara Eliya", "Kandy", "Badulla"],
        specializations: ["Tea Estates", "Hill Country"],
        rating: 4.6,
        reviewCount: 28,
        dealsCount: 73,
        isVerified: true
    }
]

export default function AgentsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                                Turn Your Network Into Income
                            </h1>
                            <p className="text-xl text-white/80 mb-8">
                                Join the Landsale Agent Network. We send you qualified leads in your area.
                                You close deals. Simple.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90" asChild>
                                    <a href="#register">
                                        Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                    How It Works
                                </Button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold">150+</div>
                                <div className="text-sm text-white/70">Active Agents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold">500+</div>
                                <div className="text-sm text-white/70">Leads/Month</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold">Rs.0</div>
                                <div className="text-sm text-white/70">Joining Fee</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Join?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-card rounded-xl border border-border">
                            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Exclusive Leads</h3>
                            <p className="text-muted-foreground">
                                Get notified instantly when a seller in your area posts a new listing.
                            </p>
                        </div>
                        <div className="text-center p-6 bg-card rounded-xl border border-border">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Grow Your Brand</h3>
                            <p className="text-muted-foreground">
                                Your profile is shown to buyers looking for properties in your areas.
                            </p>
                        </div>
                        <div className="text-center p-6 bg-card rounded-xl border border-border">
                            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Verified Status</h3>
                            <p className="text-muted-foreground">
                                Stand out with a "Verified Agent" badge after our review.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Agents */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-4">Featured Agents</h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        These top-performing agents have closed multiple deals through Landsale.lk
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {FEATURED_AGENTS.map(agent => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <div id="register" className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AgentRegistrationForm />
                </div>
            </div>
        </div>
    )
}
