import { Heart, MapPin, Ruler, Bed, Bath } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getUserFavorites } from "@/lib/actions/favorites"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { getPropertyImageUrl, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
    const favorites = await getUserFavorites()

    if (!favorites || favorites.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
                    <p className="text-muted-foreground">
                        Properties you have saved for later.
                    </p>
                </div>
                <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-sm">
                        Browse our listings and click the heart icon to save properties you are interested in.
                    </p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/search">Browse Properties</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
                <p className="text-muted-foreground">
                    {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved for later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.filter(Boolean).map((favorite) => {
                    if (!favorite) return null
                    const property = favorite.properties as any
                    if (!property) return null

                    return (
                        <div
                            key={favorite.id}
                            className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all overflow-hidden"
                        >
                            <Link href={`/properties/${property.id}`} className="block">
                                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                                    <img
                                        src={getPropertyImageUrl(property.images?.[0])}
                                        alt={property.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className={property.status === 'active' ? "bg-emerald-600" : "bg-slate-600"}>
                                            {property.status === 'active' ? 'FOR SALE' : property.status?.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                        {property.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-3 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" /> {property.city}, {property.district}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground">
                                        <span className="flex items-center"><Ruler className="w-3 h-3 mr-1" /> {property.size}</span>
                                        {property.bedrooms && <span className="flex items-center"><Bed className="w-3 h-3 mr-1" /> {property.bedrooms} Bed</span>}
                                        {property.bathrooms && <span className="flex items-center"><Bath className="w-3 h-3 mr-1" /> {property.bathrooms} Bath</span>}
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            LKR {formatPrice(property.price)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            {/* Remove from favorites button */}
                            <div className="px-5 pb-5">
                                <FavoriteButton
                                    propertyId={property.id}
                                    initialFavorited={true}
                                    variant="default"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
