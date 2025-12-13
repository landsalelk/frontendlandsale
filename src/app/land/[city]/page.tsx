import { Metadata } from "next"
import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query } from "node-appwrite"
import SearchClient from "@/components/features/search/SearchClient"
import { PropertyProps } from "@/components/features/properties/PropertyCard"
import { getPropertyImageUrl, transformListingToProperty } from "@/lib/utils"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { city } = await params
    const formattedCity = decodeURIComponent(city).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    return {
        title: `Land for sale in ${formattedCity} | Best Prices | Landsale.lk`,
        description: `Find the best land for sale in ${formattedCity}. Checked titles, affordable prices, and verified sellers. View listings in ${formattedCity} now.`,
        openGraph: {
            title: `Land for sale in ${formattedCity} - Landsale.lk`,
            description: `Looking for land in ${formattedCity}? Browse verified listings with prices and photos.`,
        }
    }
}

export default async function CityLandingPage({ params }: PageProps) {
    const { city } = await params
    const formattedCity = decodeURIComponent(city).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    let properties: PropertyProps[] = []
    let avgPrice = 0
    let totalProperties = 0

    try {
        const { databases } = await createAdminClient()

        // 1. Get Listings
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('listing_type', 'sale'),
                Query.orderDesc('$createdAt'),
                Query.limit(100)
            ]
        )

        // 2. Filter Client-Side (due to JSON location storage)
        // In a real production app, we would use Appwrite Attributes for filtered queries
        let dbProperties = response.documents.filter(p => {
            try {
                // Check if location JSON string contains the city
                // This is a "Programmatic SEO" hack until easier DB filtering is set up
                if (typeof p.location === 'string') {
                    return p.location.toLowerCase().includes(city.toLowerCase().replace(/-/g, ' '))
                }
                return false
            } catch {
                return false
            }
        })

        if (dbProperties.length > 0) {
            properties = dbProperties.map(p => {
                const transformed = transformListingToProperty(p);
                return {
                    id: p.$id,
                    title: transformed.title || "Untitled Property",
                    price: transformed.price || 0,
                    location: `${transformed.city || 'Unknown'}, ${transformed.district || ''}`,
                    image: getPropertyImageUrl(transformed.images?.[0]),
                    type: transformed.type || "land",
                    beds: transformed.bedrooms || 0,
                    baths: transformed.bathrooms || 0,
                    size: transformed.size || "N/A",
                    slug: p.$id,
                    isFeatured: false
                };
            });

            // Calculate "Market Insights" for the page
            totalProperties = properties.length
            const totalPrice = properties.reduce((sum, p) => sum + (p.price || 0), 0)
            avgPrice = totalProperties > 0 ? totalPrice / totalProperties : 0
        }

    } catch (error) {
        console.error("Error fetching city properties:", error)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* SEO Header Section */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link href="/properties" className="hover:text-primary">Land</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-foreground font-medium">{formattedCity}</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
                        Land for sale in <span className="text-emerald-600">{formattedCity}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Browse {totalProperties > 0 ? totalProperties : 'availble'} verified lands in {formattedCity}.
                        {avgPrice > 0 && ` Market average price is roughly Rs. ${(avgPrice / 100000).toFixed(1)} Lakhs.`}
                    </p>
                </div>
            </div>

            {/* Properties List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SearchClient initialProperties={properties} />

                {properties.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                        <h3 className="text-lg font-medium">No properties found in {formattedCity} yet</h3>
                        <p className="text-muted-foreground mt-2">Be the first to create a focused listing here.</p>
                        <Link href="/dashboard/post-ad" className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            Post Free Ad in {formattedCity}
                        </Link>
                    </div>
                )}
            </div>

            {/* SEO Content Footer (Keyword Rich) */}
            <div className="bg-white dark:bg-slate-950 border-t border-border mt-12 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-4">Why Buy Land in {formattedCity}?</h2>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p>
                            Are you looking for the perfect plot of land in {formattedCity}? You've come to the right place.
                            Landsale.lk offers the most comprehensive list of bare lands, coconut estates, and residential plots in the {formattedCity} area.
                        </p>
                        <p className="mt-4">
                            Whether you are buying for investment or to build your dream home, {formattedCity} offers great potential.
                            Our "Price Meter" helps you ensure you aren't paying too much, and our verified badges protect you from scams.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
