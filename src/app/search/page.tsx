import Link from "next/link"
import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query } from "node-appwrite"
import SearchClient from "@/components/features/search/SearchClient"
import { PropertyProps } from "@/components/features/properties/PropertyCard"
import { getPropertyImageUrl } from "@/lib/utils"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Mock Data Fallback
const MOCK_PROPERTIES: PropertyProps[] = [
    {
        id: "1",
        title: "Scenic Land in Kandy",
        price: 3500000,
        location: "Kandy, Central Province",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
        type: "land",
        size: "20 Perches",
        slug: "scenic-land-kandy",
        isFeatured: true,
    },
    {
        id: "2",
        title: "Luxury Villa with Pool",
        price: 85000000,
        location: "Negombo, Western Province",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227",
        type: "house",
        beds: 4,
        baths: 3,
        size: "3000 Sqft",
        slug: "luxury-villa-negombo",
    },
    {
        id: "3",
        title: "Commercial Plot Colombo 07",
        price: 150000000,
        location: "Colombo 07, Western Province",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        type: "commercial",
        size: "15 Perches",
        slug: "commercial-plot-colombo-07",
        isFeatured: true,
    },
    {
        id: "4",
        title: "Coconut Estate for Sale",
        price: 45000000,
        location: "Kurunegala, North Western",
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1",
        type: "land",
        size: "5 Acres",
        slug: "coconut-estate-kurunegala",
    },
]

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams

    const query = typeof resolvedParams.query === 'string' ? resolvedParams.query : undefined
    const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined
    const minPrice = typeof resolvedParams.minPrice === 'string' ? Number(resolvedParams.minPrice) : undefined
    const maxPrice = typeof resolvedParams.maxPrice === 'string' ? Number(resolvedParams.maxPrice) : undefined
    const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : undefined
    const province = typeof resolvedParams.province === 'string' ? resolvedParams.province : undefined
    const beds = typeof resolvedParams.beds === 'string' ? Number(resolvedParams.beds) : undefined
    const baths = typeof resolvedParams.baths === 'string' ? Number(resolvedParams.baths) : undefined

    let properties: PropertyProps[] = []

    try {
        const { databases } = await createAdminClient()

        // Build query filters
        const filters: string[] = []

        if (type && type !== 'all') {
            filters.push(Query.equal('listing_type', type === 'land' ? 'sale' : type)) // Map old type to new listing_type
        }
        if (minPrice) {
            filters.push(Query.greaterThanEqual('price', minPrice))
        }
        if (maxPrice) {
            filters.push(Query.lessThanEqual('price', maxPrice))
        }
        if (province && province !== 'all') {
            // For new schema, we need to filter by location JSON field
            filters.push(Query.contains('location', `"region":"${province}"`))
        }

        // Add ordering and limit
        filters.push(Query.orderDesc('$createdAt'))
        filters.push(Query.limit(20))

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            filters
        )

        // Filter by search query and city (Appwrite doesn't have full-text search built-in)
        let dbProperties = response.documents

        if (query) {
            const lowerQuery = query.toLowerCase()
            dbProperties = dbProperties.filter(p => {
                // Safely parse title and location for filtering
                let title = ''
                let location: { region: string; city: string } = { region: '', city: '' }
                
                try {
                    if (p.title) {
                        const parsedTitle = JSON.parse(p.title)
                        title = parsedTitle.en || parsedTitle.toString() || p.title
                    }
                } catch {
                    title = p.title || ''
                }
                
                try {
                    if (p.location) {
                        const parsedLocation = JSON.parse(p.location)
                        location = {
                            region: parsedLocation.region || '',
                            city: parsedLocation.city || ''
                        }
                    }
                } catch {
                    location = { city: p.location, region: p.location }
                }
                
                return (
                    title.toLowerCase().includes(lowerQuery) ||
                    location.city?.toLowerCase().includes(lowerQuery) ||
                    location.region?.toLowerCase().includes(lowerQuery)
                )
            })
        }

        if (city) {
            const lowerCity = city.toLowerCase()
            dbProperties = dbProperties.filter(p => {
                let location: { region: string; city: string } = { region: '', city: '' }
                try {
                    if (p.location) {
                        const parsedLocation = JSON.parse(p.location)
                        location = {
                            region: parsedLocation.region || '',
                            city: parsedLocation.city || ''
                        }
                    }
                } catch {
                    location = { city: p.location, region: '' }
                }
                return location.city?.toLowerCase().includes(lowerCity)
            })
        }

        if (dbProperties.length > 0) {
            properties = dbProperties.map(p => {
                try {
                    // Safely parse JSON fields with fallback to plain text
                    let title = "Untitled Property"
                    let location: { region: string; city: string } = { region: '', city: '' }
                    let attributes: { size?: string; bedrooms?: number; bathrooms?: number } = {}
                    
                    // Handle title field
                    if (p.title) {
                        try {
                            const parsedTitle = JSON.parse(p.title)
                            title = parsedTitle.en || parsedTitle.toString() || p.title
                        } catch {
                            title = p.title
                        }
                    }
                    
                    // Handle location field
                    if (p.location) {
                        try {
                            const parsedLocation = JSON.parse(p.location)
                            location = {
                                region: parsedLocation.region || '',
                                city: parsedLocation.city || ''
                            }
                        } catch {
                            location = { city: p.location, region: p.location }
                        }
                    } else {
                        location = { region: '', city: '' }
                    }
                    
                    // Handle attributes field
                    if (p.attributes) {
                        try {
                            attributes = JSON.parse(p.attributes)
                        } catch {
                            attributes = { size: p.attributes, bedrooms: 0, bathrooms: 0 }
                        }
                    }
                    
                    return {
                        id: p.$id,
                        title: title || "Untitled Property",
                        price: p.price ? p.price / 100 : 0,
                        location: `${location.city || 'Unknown'}, ${location.region || 'Location'}`,
                        image: getPropertyImageUrl(p.images?.[0]),
                        type: p.listing_type === 'sale' ? 'land' : p.listing_type || "land",
                        beds: attributes.bedrooms || 0,
                        baths: attributes.bathrooms || 0,
                        size: attributes.size || "N/A",
                        slug: p.$id,
                        isFeatured: false
                    }
                } catch (error) {
                    console.error("Error transforming property:", error)
                    return {
                        id: p.$id,
                        title: "Untitled Property",
                        price: 0,
                        location: "Unknown Location",
                        image: getPropertyImageUrl(p.images?.[0]),
                        type: "land",
                        beds: 0,
                        baths: 0,
                        size: "N/A",
                        slug: p.$id,
                        isFeatured: false
                    }
                }
            })
        }
    } catch (error) {
        console.error("[Search] Error fetching properties:", error)
        if (process.env.NODE_ENV === 'development') {
            properties = MOCK_PROPERTIES
        }
    }

    if (properties.length === 0 && process.env.NODE_ENV === 'development') {
        properties = MOCK_PROPERTIES
    }

    return <SearchClient initialProperties={properties} />
}
