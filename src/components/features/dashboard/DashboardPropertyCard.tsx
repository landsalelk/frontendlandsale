"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MoreHorizontal, Pencil, Trash2, Eye, MapPin, Loader2, Home, Trees, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdHealthDashboard } from "./AdHealthDashboard"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deleteProperty } from "@/lib/actions/property"
import { formatPrice, getPropertyImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Property type compatible with Appwrite documents
interface Property {
    id: string
    title: string
    type: string
    status: string
    price: number
    price_negotiable?: boolean
    size?: string
    city?: string
    district?: string
    images?: string[]
    views?: number
    features?: string[]
    bedrooms?: number
    bathrooms?: number
    created_at: string
    description?: string
}


// Helper function to get property type icon and placeholder
const getPropertyTypeInfo = (type: string) => {
    switch (type) {
        case 'land':
            return {
                icon: Trees,
                placeholder: "/1/336.jpg", // Scenic land/property image
                color: "text-green-600",
                bgColor: "bg-green-50 dark:bg-green-950/20"
            }
        case 'house':
            return {
                icon: Home,
                placeholder: "/1/338.jpg", // House/property image
                color: "text-blue-600",
                bgColor: "bg-blue-50 dark:bg-blue-950/20"
            }
        case 'commercial':
            return {
                icon: Building,
                placeholder: "/1/340.jpg", // Commercial building image
                color: "text-purple-600",
                bgColor: "bg-purple-50 dark:bg-purple-950/20"
            }
        default:
            return {
                icon: Home,
                placeholder: "/1/342.jpg", // Generic property image
                color: "text-gray-600",
                bgColor: "bg-gray-50 dark:bg-gray-950/20"
            }
    }
}

export function DashboardPropertyCard({ property }: { property: Property }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [isHealthOpen, setIsHealthOpen] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this listing?")) return

        setIsDeleting(true)
        const toastId = toast.loading("Deleting property...")

        try {
            const res = await deleteProperty(property.id)
            if (res?.error) {
                toast.error(res.error, { id: toastId })
            } else {
                toast.success("Property deleted successfully", { id: toastId })
            }
        } catch (e) {
            toast.error("Error deleting property", { id: toastId })
        } finally {
            setIsDeleting(false)
        }
    }

    const propertyTypeInfo = getPropertyTypeInfo(property.type)
    const PropertyIcon = propertyTypeInfo.icon

    // Determine display image with fallback chain
    const displayImage = property.images?.[0] && !imageError
        ? getPropertyImageUrl(property.images[0])
        : propertyTypeInfo.placeholder

    return (
        <div className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4 bg-card hover:shadow-lg transition-all duration-200 group">
            <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-lg overflow-hidden bg-muted">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                )}
                <Image
                    src={displayImage}
                    alt={property.title}
                    fill
                    className={cn(
                        "object-cover transition-all duration-300",
                        imageLoading ? "opacity-0" : "opacity-100",
                        "group-hover:scale-105"
                    )}
                    sizes="(max-width: 640px) 100vw, 200px"
                    onLoadingComplete={() => setImageLoading(false)}
                    onError={() => {
                        setImageError(true)
                        setImageLoading(false)
                    }}
                    priority={false}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                        variant={property.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs font-medium"
                    >
                        {property.status}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn("text-xs font-medium", propertyTypeInfo.bgColor, propertyTypeInfo.color)}
                    >
                        <PropertyIcon className="w-3 h-3 mr-1" />
                        {property.type}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-2">
                            <h3 className="font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {property.title}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center mt-2">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="line-clamp-1">{property.city}, {property.district}</span>
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-9 w-9 p-0 ml-2 hover:bg-muted transition-colors"
                                    aria-label="Property actions"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Property Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/edit/${property.id}`} className="cursor-pointer">
                                        <Pencil className="mr-2 h-4 w-4" /> Edit Listing
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/properties/${property.id}`} className="cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" /> View Live
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleDelete()
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    {isDeleting ? "Deleting..." : "Delete Listing"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-3">
                        <p className="font-bold text-2xl text-primary">
                            LKR {formatPrice(property.price)}
                        </p>
                        {property.price_negotiable && (
                            <Badge variant="outline" className="mt-1 text-xs">
                                Negotiable
                            </Badge>
                        )}
                    </div>

                    {property.size && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span className="font-medium">{property.size} perches</span>
                            {property.bedrooms && property.bedrooms > 0 && (
                                <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span>{property.bedrooms} bed</span>
                                </>
                            )}
                            {property.bathrooms && property.bathrooms > 0 && (
                                <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span>{property.bathrooms} bath</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3 mt-auto">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent hover:text-primary transition-colors flex items-center gap-1 group/health"
                            onClick={() => setIsHealthOpen(true)}
                        >
                            <div className="flex items-center gap-1" title="Click to view detailed analytics">
                                <Eye className="w-4 h-4 group-hover/health:translate-x-0.5 transition-transform" />
                                <span className="font-medium underline decoration-dotted underline-offset-4">{property.views || 0} views</span>
                            </div>
                        </Button>

                        {property.features && property.features.length > 0 && (
                            <div className="flex items-center gap-1" title="Features">
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                    {property.features.length} features
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="text-xs" title="Posted date">
                        {new Date(property.created_at).toLocaleDateString('en-LK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            <AdHealthDashboard
                property={property}
                open={isHealthOpen}
                onOpenChange={setIsHealthOpen}
            />
        </div>
    )
}
