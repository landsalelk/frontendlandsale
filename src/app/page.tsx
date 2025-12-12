import NextImage from "next/image"
import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query } from "node-appwrite"
import Link from "next/link"
import { ArrowRight, Bed, Bath, Ruler, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HeroSearchBar } from "@/components/features/search/HeroSearchBar"
import { getPropertyImageUrl, formatPrice } from "@/lib/utils"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function Home() {
  let featuredProperties: any[] = []
    let fetchError = null
    
    try {
        const { databases } = await createAdminClient()
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('status', 'active'),
                Query.orderDesc('$createdAt'),
                Query.limit(3)
            ]
        )
        featuredProperties = response.documents.map((listing: any) => {
            // Transform new schema to old format for compatibility
            try {
                // Safely parse JSON fields with fallback to plain text
                let title = ''
                let location: { region: string; city: string } = { region: '', city: '' }
                let attributes: { size?: string; bedrooms?: number; bathrooms?: number } = {}
                
                // Handle title field
                if (listing.title) {
                    try {
                        const parsedTitle = JSON.parse(listing.title)
                        title = parsedTitle.en || parsedTitle.toString() || listing.title
                    } catch {
                        // If JSON parsing fails, use as plain text
                        title = listing.title
                    }
                }
                
                // Handle location field
                if (listing.location) {
                    try {
                        const parsedLocation = JSON.parse(listing.location)
                        location = {
                            region: parsedLocation.region || '',
                            city: parsedLocation.city || ''
                        }
                    } catch {
                        // If JSON parsing fails, create a basic location object
                        location = { 
                            region: listing.location,
                            city: listing.location 
                        }
                    }
                } else {
                    location = { region: '', city: '' }
                }
                
                // Handle attributes field
                if (listing.attributes) {
                    try {
                        const parsedAttributes = JSON.parse(listing.attributes)
                        attributes = { 
                            size: parsedAttributes.size || '',
                            bedrooms: parsedAttributes.bedrooms || 0,
                            bathrooms: parsedAttributes.bathrooms || 0
                        }
                    } catch {
                        // If JSON parsing fails, create basic attributes
                        attributes = { 
                            size: listing.attributes,
                            bedrooms: 0,
                            bathrooms: 0 
                        }
                    }
                } else {
                    attributes = { size: '', bedrooms: 0, bathrooms: 0 }
                }
                
                return {
                    ...listing,
                    title,
                    type: listing.listing_type === 'sale' ? 'land' : listing.listing_type,
                    district: location.region || '',
                    city: location.city || '',
                    price: listing.price ? listing.price / 100 : 0,
                    size: attributes.size || '',
                    bedrooms: attributes.bedrooms || 0,
                    bathrooms: attributes.bathrooms || 0,
                    views: listing.views_count || 0,
                }
            } catch (error) {
                console.error("Error transforming listing:", error)
                return listing
            }
        })
    } catch (error: any) {
        console.error("Error fetching featured properties:", error)
        
        // Provide more helpful error messages based on the error type
        if (error.code === 401 && error.type === 'user_unauthorized') {
            fetchError = "API key lacks necessary permissions. Please ensure your Appwrite API key has the required scopes (databases.read, documents.read, etc.)"
        } else {
            fetchError = error.message || "Failed to load featured properties"
        }
        
        // Return empty array as fallback
        featuredProperties = []
    }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900/80 to-slate-900 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30" />

        <div className="max-w-7xl mx-auto relative z-20 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Find Your Dream Land <br /> in <span className="text-emerald-400">Sri Lanka</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            The most trusted marketplace for buying, selling, and renting properties across the island.
          </p>

          {/* Main Search Bar */}
          <HeroSearchBar />
        </div>
      </section>

      {/* Featured Properties Preview */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked selections just for you.</p>
            </div>
            <Link href="/search" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {fetchError ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-2">Unable to load featured properties</div>
              <p className="text-gray-500 text-sm">{fetchError}</p>
              <p className="text-gray-400 mt-2">Please check your connection or try refreshing the page</p>
            </div>
          ) : featuredProperties?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No featured properties available</div>
              <p className="text-gray-400 mt-2">Check back soon for new listings</p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredProperties?.map((property) => (
                <Link href={`/properties/${property.$id}`} key={property.$id} className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer block">
                  <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                    <NextImage
                      src={getPropertyImageUrl(property.images?.[0])}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={property.status === 'active' ? "bg-emerald-600" : "bg-slate-600"}>
                        {property.status === 'active' ? 'FOR SALE' : property.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{property.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {property.city}, {property.district}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
                      <span className="flex items-center"><Ruler className="w-3 h-3 mr-1" /> {property.size}</span>
                      {property.bedrooms && <span className="flex items-center"><Bed className="w-3 h-3 mr-1" /> {property.bedrooms} Bed</span>}
                      {property.bathrooms && <span className="flex items-center"><Bath className="w-3 h-3 mr-1" /> {property.bathrooms} Bath</span>}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-xl font-bold text-emerald-600">
                        LKR {formatPrice(property.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-[128px] opacity-20 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Sell Your Property?</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            List your property on landsale.lk and reach thousands of potential buyers instantly.
          </p>
          <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold h-14 px-10 text-lg rounded-full" asChild>
            <Link href="/dashboard/post-ad">Start Selling Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
