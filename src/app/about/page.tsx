import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight mb-6">About LandSale.lk</h1>
            <div className="prose dark:prose-invert max-w-none space-y-6 text-lg text-slate-700 dark:text-slate-300">
                <p>
                    Welcome to LandSale.lk, Sri Lanka's premier digital marketplace dedicated exclusively to land and property sales.
                    Founded in 2024, our mission is to simplify the complex process of buying and selling real estate in Sri Lanka through technology and trust.
                </p>
                <p>
                    Whether you are looking for a plot to build your dream home, agricultural land for investment, or a commercial property for your business,
                    we connect buyers and sellers directly, removing the traditional barriers and inefficiencies.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
                <p>
                    To be the most trusted and transparent property marketplace in Sri Lanka, empowering every citizen to own a piece of their motherland.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us?</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Verified Listings:</strong> We prioritize quality over quantity.</li>
                    <li><strong>User-Friendly Interface:</strong> Designed for everyone, from first-time buyers to seasoned investors.</li>
                    <li><strong>Island-wide Coverage:</strong> From Colombo to Jaffna, Galle to Kandy.</li>
                </ul>
            </div>

            <div className="mt-12 flex justify-center">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                    <Link href="/search">Browse Properties</Link>
                </Button>
            </div>
        </div>
    )
}
