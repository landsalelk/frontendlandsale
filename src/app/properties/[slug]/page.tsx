import Image from "next/image"
import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { Phone, MessageCircle, MapPin, Share2, User, Calendar, Bed, Bath, Ruler, Search } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createAdminClient, getCurrentUser, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { checkIsFavorited } from "@/lib/actions/favorites"
import { notFound } from "next/navigation"
import { getPropertyImageUrl, formatPrice, transformListingToProperty } from "@/lib/utils"
import { InquiryForm } from "@/components/features/properties/InquiryForm"
import { PropertyImageGallery } from "@/components/features/properties/PropertyImageGallery"
import { SimilarProperties } from "@/components/features/properties/SimilarProperties"
import { getSimilarProperties, incrementPropertyViews } from "@/lib/actions/property"

// Psychological Trigger Components
import LiveViewCounter from "@/components/features/properties/LiveViewCounter"
import AiFutureVision from "@/components/features/properties/AiFutureVision"
import SmartNotification from "@/components/features/properties/SmartNotification"
import MarketInsights from "@/components/features/properties/MarketInsights"
import AiInvestmentTip from "@/components/features/properties/AiInvestmentTip"
import RoiCalculator from "@/components/features/properties/RoiCalculator"
import TrustBadge from "@/components/features/properties/TrustBadge"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params

    try {
        const { databases } = await createAdminClient()
        const listing = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, slug)
        const property = transformListingToProperty(listing)

        const imageUrl = getPropertyImageUrl(property.images?.[0])
        const description = property.description?.slice(0, 160) || `${property.title} in ${property.city}, ${property.district}`

        return {
            title: `${property.title} | LandSale.lk`,
            description,
            openGraph: {
                title: property.title,
                description,
                images: [imageUrl],
                type: 'website',
                siteName: 'LandSale.lk',
            },
            twitter: {
                card: 'summary_large_image',
                title: property.title,
                description,
                images: [imageUrl],
            },
        }
    } catch {
        return {
            title: 'Property Not Found | LandSale.lk',
        }
    }
}


export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    let property: any
    try {
        const { databases } = await createAdminClient()
        const listing = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, slug)
        property = transformListingToProperty(listing)
    } catch (error) {
        console.error("Property fetch error:", error)
        return (
            <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
                <div className="text-center max-w-md">
                    <Search className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        The property you're looking for doesn't exist or may have been removed.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href="/properties">Browse Properties</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">Return Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if property is favorited by current user
    const isFavorited = await checkIsFavorited(property.$id)

    // Fetch similar properties
    const similarProperties = await getSimilarProperties(property.$id, property.type, property.district)

    // Check if user is logged in (for inquiry form)
    const user = await getCurrentUser()
    const isLoggedIn = !!user
    const isOwnProperty = user?.$id === property.user_id

    // Increment view count (non-blocking)
    incrementPropertyViews(property.$id).catch(() => {
        // Silently fail - view tracking is non-critical
    })

    // Format fields
    const formattedPrice = `LKR ${formatPrice(property.price)}`

    const postedDate = new Date(property.$createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    let rawImages = property.images || [];
    // Filter out generated variants (original, preview, thumbnail) to avoid duplicates in gallery
    const standardImages = rawImages.filter((img: string) =>
        !img.includes('_original') &&
        !img.includes('_preview') &&
        !img.includes('_thumbnail')
    );

    // Use standard images if available, otherwise fall back to whatever is there
    const imagesToUse = standardImages.length > 0 ? standardImages : rawImages;

    const displayImages = imagesToUse.length > 0
        ? imagesToUse.map((img: string) => getPropertyImageUrl(img))
        : ["/placeholder-property.jpg"]

    // SEO Structured Data (JSON-LD)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": property.description,
        "url": `https://landsale.lk/properties/${property.$id}`,
        "datePosted": property.$createdAt,
        "image": displayImages,
        "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "LKR",
            "availability": property.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": property.city,
            "addressRegion": property.district,
            "addressCountry": "LK"
        },
        "numberOfRooms": property.bedrooms || undefined,
        "numberOfBathroomsTotal": property.bathrooms || undefined
    }

    return (
        <div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* GLOBAL URGENCY NOTIFICATION (Sticky/Fixed) */}
            <SmartNotification />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb / Top Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center text-sm text-muted-foreground flex-wrap">
                        Home / {property.district} / {property.type} / <span className="text-foreground ml-1 font-medium truncate max-w-[200px]">{property.title}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" aria-label="Share this property on social media">
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <FavoriteButton propertyId={property.$id} initialFavorited={isFavorited} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery with Lightbox */}
                        <PropertyImageGallery
                            images={displayImages}
                            title={property.title}
                            status={property.status}
                        />

                        {/* Title & Key Info */}
                        <div>
                            <div className="flex flex-col gap-2">
                                {/* FOMO & TRUST TRIGGERS */}
                                <div className="flex items-center gap-3 mb-1">
                                    <LiveViewCounter />
                                    <TrustBadge />
                                </div>

                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{property.title}</h1>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
                                    {property.city}, {property.district}
                                </div>
                                {property.address && (
                                    <p className="text-sm text-muted-foreground">{property.address}</p>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Badge variant="secondary" className="text-sm px-3 py-1 capitalize">
                                    {property.type}
                                </Badge>
                                <Badge variant="outline" className="text-sm px-3 py-1 flex items-center">
                                    <Ruler className="h-3 w-3 mr-1" /> {property.size}
                                </Badge>
                                {property.bedrooms && (
                                    <Badge variant="outline" className="text-sm px-3 py-1 flex items-center">
                                        <Bed className="h-3 w-3 mr-1" /> {property.bedrooms} Beds
                                    </Badge>
                                )}
                                {property.bathrooms && (
                                    <Badge variant="outline" className="text-sm px-3 py-1 flex items-center">
                                        <Bath className="h-3 w-3 mr-1" /> {property.bathrooms} Baths
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1" /> Posted {postedDate}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Description</h3>
                            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                {property.description}
                            </div>
                        </div>

                        {/* NEW: AI INVESTMENT TIP */}
                        <AiInvestmentTip city={property.city} />

                        {/* VISUAL CRAVING: AI Future Vision (Only for Land) */}
                        <AiFutureVision
                            propertyType={property.type}
                            propertyTitle={property.title}
                            location={property.city}
                        />

                        <Separator />

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Features</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {property.features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-center text-slate-700 dark:text-slate-300">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Separator className="mt-8" />
                            </div>
                        )}

                        {/* Location / Map */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Location</h3>
                            <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center border relative overflow-hidden group">
                                <MapPin className="h-10 w-10 text-emerald-600 mb-2 relative z-10" />
                                <p className="text-muted-foreground font-medium relative z-10 mb-4">{property.address || property.city}, {property.district}</p>

                                <Button asChild variant="outline" className="relative z-10 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 backdrop-blur">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address || ''} ${property.city} ${property.district} Sri Lanka`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View on Google Maps
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <CardHeader>
                                <CardDescription>Price {property.price_negotiable ? "(Negotiable)" : ""}</CardDescription>
                                <CardTitle className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                                    {formattedPrice}
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        {/* ROI CALCULATOR (Greed) */}
                        <RoiCalculator price={property.price} city={property.city} />

                        {/* Agent/Seller Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="" />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{property.contact_name || 'Seller'}</CardTitle>
                                        <CardDescription>Seller</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {property.contact_phone && (
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12 text-lg" asChild>
                                        <a href={`tel:${property.contact_phone}`}>
                                            <Phone className="mr-2 h-5 w-5" /> Call Seller
                                        </a>
                                    </Button>
                                )}
                                {(property.whatsapp || property.contact_phone) && (
                                    <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 h-12 text-lg" asChild>
                                        <a href={`https://wa.me/${(property.whatsapp || property.contact_phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* MARKET INSIGHTS */}
                        <MarketInsights city={property.city} district={property.district} />

                        {/* Inquiry Form - Only show if not own property */}
                        {!isOwnProperty && (
                            <InquiryForm
                                propertyId={property.$id}
                                sellerId={property.user_id}
                                propertyTitle={property.title}
                                isLoggedIn={isLoggedIn}
                            />
                        )}
                    </div>
                </div>

                <SimilarProperties properties={similarProperties} />
            </div>
        </div>
    )
}