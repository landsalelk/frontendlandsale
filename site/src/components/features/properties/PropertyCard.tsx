import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Ruler, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export interface PropertyProps {
    id: string
    title: string
    price: number
    location: string
    image: string
    type: 'land' | 'house' | 'commercial'
    beds?: number
    baths?: number
    size: string
    slug: string
    isFeatured?: boolean
}

export function PropertyCard({ property }: { property: PropertyProps }) {
    return (
        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Link href={`/properties/${property.slug}`}>
                    <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </Link>
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={property.type === 'land' ? 'secondary' : 'default'} className="uppercase font-bold tracking-wider">
                        {property.type}
                    </Badge>
                    {property.isFeatured && (
                        <Badge variant="destructive" className="uppercase font-bold tracking-wider animate-pulse">
                            Featured
                        </Badge>
                    )}
                </div>
                <Button size="icon" variant="ghost" className="absolute top-3 right-3 text-white hover:bg-black/20 hover:text-red-500 rounded-full">
                    <Heart className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-bold text-xl">LKR {formatPrice(property.price)}</p>
                </div>
            </div>

            <CardContent className="p-4">
                <Link href={`/properties/${property.slug}`} className="block">
                    <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {property.title}
                    </h3>
                </Link>
                <div className="flex items-center text-muted-foreground mt-2 text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
                    {property.location}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
                    {property.type !== 'land' && (
                        <>
                            <div className="flex items-center gap-1">
                                <BedDouble className="h-4 w-4" />
                                <span>{property.beds}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                <span>{property.baths}</span>
                            </div>
                        </>
                    )}
                    <div className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        <span>{property.size}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                    <Link href={`/properties/${property.slug}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
