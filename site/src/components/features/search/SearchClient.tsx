"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PropertyCard, PropertyProps } from "@/components/features/properties/PropertyCard"
import { InteractivePropertyCard } from "@/components/features/properties/InteractivePropertyCard"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal, X, Filter, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CityAutocomplete } from "@/components/ui/city-autocomplete"
import { getRegions } from "@/lib/actions/location"

interface Region {
    id: string
    name: string
    slug: string
}

export default function SearchClient({ initialProperties }: { initialProperties: PropertyProps[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Region/City state
    const [regions, setRegions] = useState<Region[]>([])
    const [selectedProvince, setSelectedProvince] = useState<string>(searchParams.get("province") || "")
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
    const [city, setCity] = useState(searchParams.get("city") || "")

    // Filter States
    const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") || "")

    // Price States
    const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "")
    const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "")

    // Room States
    const [beds, setBeds] = useState<string>(searchParams.get("beds") || "")
    const [baths, setBaths] = useState<string>(searchParams.get("baths") || "")

    // Sort State
    const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest")

    // Fetch regions on mount
    useEffect(() => {
        const fetchRegions = async () => {
            const data = await getRegions()
            setRegions(data)

            // If there's a province in URL, find and set its region ID
            const provinceParam = searchParams.get("province")
            if (provinceParam) {
                const matchingRegion = data.find((r: Region) => r.name === provinceParam)
                if (matchingRegion) {
                    setSelectedRegionId(matchingRegion.id)
                }
            }
        }
        fetchRegions()
    }, [searchParams])

    // Sync state with URL params on mount/update
    useEffect(() => {
        setCity(searchParams.get("city") || "")
        setSelectedType(searchParams.get("type") || "")
        setMinPrice(searchParams.get("minPrice") || "")
        setMaxPrice(searchParams.get("maxPrice") || "")
        setBeds(searchParams.get("beds") || "")
        setBaths(searchParams.get("baths") || "")
        setSelectedProvince(searchParams.get("province") || "")
        setSortBy(searchParams.get("sort") || "newest")
    }, [searchParams])

    const handleProvinceChange = (provinceName: string) => {
        setSelectedProvince(provinceName)
        const region = regions.find(r => r.name === provinceName)
        if (region) {
            setSelectedRegionId(region.id)
        } else {
            setSelectedRegionId(null)
        }
        setCity("") // Reset city when province changes
    }

    const applyFilters = () => {
        const params = new URLSearchParams()

        if (selectedProvince && selectedProvince !== "all") params.set("province", selectedProvince)
        if (city) params.set("city", city)
        if (selectedType && selectedType !== "all") params.set("type", selectedType)
        if (minPrice) params.set("minPrice", minPrice)
        if (maxPrice) params.set("maxPrice", maxPrice)
        if (beds && beds !== "0") params.set("beds", beds)
        if (baths && baths !== "0") params.set("baths", baths)
        if (sortBy && sortBy !== "newest") params.set("sort", sortBy)

        router.push(`/search?${params.toString()}`)
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "newest") {
            params.set("sort", value)
        } else {
            params.delete("sort")
        }
        router.push(`/search?${params.toString()}`)
    }

    const clearFilters = () => {
        setSelectedProvince("")
        setSelectedRegionId(null)
        setCity("")
        setSelectedType("")
        setMinPrice("")
        setMaxPrice("")
        setBeds("")
        setBaths("")
        setSortBy("newest")
        router.push("/search")
    }

    const hasActiveFilters = selectedProvince || city || selectedType || minPrice || maxPrice || beds || baths

    // Sort properties based on selected sort option
    const sortedProperties = [...initialProperties].sort((a, b) => {
        switch (sortBy) {
            case "price_low":
                return a.price - b.price
            case "price_high":
                return b.price - a.price
            case "oldest":
                return 0 // Already sorted by server, no need to re-sort
            case "newest":
            default:
                return 0 // Already sorted by server (newest first)
        }
    })

    // Filter component (shared between desktop and mobile)
    const FilterControls = () => (
        <div className="space-y-6">
            {/* Province */}
            <div className="space-y-2">
                <Label>Province</Label>
                <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Provinces" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Provinces</SelectItem>
                        {regions.map((region) => (
                            <SelectItem key={region.id} value={region.name}>
                                {region.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* City Autocomplete */}
            <div className="space-y-2">
                <Label>City</Label>
                <CityAutocomplete
                    regionId={selectedRegionId}
                    value={city}
                    onChange={setCity}
                    placeholder="Type city name..."
                    disabled={!selectedRegionId}
                />
            </div>

            {/* Property Type */}
            <div className="space-y-2">
                <Label>Property Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="agricultural">Agricultural Land</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <Label>Price Range (LKR)</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <Input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Beds & Baths */}
            <div className="space-y-3">
                <Label>Rooms</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Select value={beds} onValueChange={setBeds}>
                            <SelectTrigger>
                                <SelectValue placeholder="Beds" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Select value={baths} onValueChange={setBaths}>
                            <SelectTrigger>
                                <SelectValue placeholder="Baths" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar - Desktop */}
                <aside className="hidden md:block w-72 shrink-0 space-y-8 bg-white dark:bg-slate-900 p-6 rounded-xl border h-fit sticky top-24">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </h3>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground hover:text-red-500">
                                Reset
                            </Button>
                        )}
                    </div>

                    <FilterControls />
                    <Button onClick={applyFilters} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Apply Filters</Button>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Properties for Sale</h1>
                            <p className="text-muted-foreground text-sm">Showing {sortedProperties.length} results</p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            {/* Sort Dropdown */}
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[160px]">
                                    <ArrowUpDown className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Mobile Filter Sheet */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden flex-1">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl pt-6">
                                    <SheetHeader className="text-left mb-4">
                                        <SheetTitle className="text-xl font-bold">Filter Properties</SheetTitle>
                                        <SheetDescription>Refine your search results.</SheetDescription>
                                    </SheetHeader>
                                    <div className="overflow-y-auto h-full pb-20 px-1">
                                        <FilterControls />
                                        <Button onClick={() => { applyFilters(); }} className="w-full mt-6 bg-emerald-600 text-white shadow-lg h-12 text-base rounded-xl">Apply Filters</Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedProvince && selectedProvince !== 'all' && (
                                <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200">
                                    Province: {selectedProvince} <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedProvince(""); setSelectedRegionId(null); setCity(""); }} />
                                </Badge>
                            )}
                            {city && (
                                <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200">
                                    City: {city} <X className="h-3 w-3 cursor-pointer" onClick={() => setCity("")} />
                                </Badge>
                            )}
                            {selectedType && selectedType !== 'all' && (
                                <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200 capitalize">
                                    Type: {selectedType} <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType("")} />
                                </Badge>
                            )}
                            {(minPrice || maxPrice) && (
                                <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200">
                                    Price: {minPrice ? minPrice : '0'} - {maxPrice ? maxPrice : 'Any'} <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinPrice(""); setMaxPrice(""); }} />
                                </Badge>
                            )}
                            {beds && beds !== '0' && (
                                <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200">
                                    Beds: {beds}+ <X className="h-3 w-3 cursor-pointer" onClick={() => setBeds("")} />
                                </Badge>
                            )}
                            {baths && baths !== '0' && (
                                <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200">
                                    Baths: {baths}+ <X className="h-3 w-3 cursor-pointer" onClick={() => setBaths("")} />
                                </Badge>
                            )}
                            <Button variant="link" size="sm" onClick={clearFilters} className="text-muted-foreground h-auto p-0 ml-2">Clear All</Button>
                        </div>
                    )}

                    {/* Property Grid */}
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={{
                            initial: { opacity: 0 },
                            animate: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {sortedProperties.map((property) => (
                            <InteractivePropertyCard
                                key={property.id}
                                property={{
                                    ...property,
                                    images: [property.image],
                                    city: property.location?.split(',')[0]?.trim() || property.location,
                                    district: property.location?.split(',')[1]?.trim() || "",
                                    featured: property.isFeatured,
                                    bedrooms: property.beds,
                                    bathrooms: property.baths,
                                } as any}
                                className={property.isFeatured ? "md:col-span-2 md:row-span-2" : ""}
                            />
                        ))}
                    </motion.div>
                    {sortedProperties.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-2xl border">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Properties Found</h3>
                            <p className="max-w-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                                We couldn't find any properties matching your filters. Try adjusting your search criteria or explore all available listings.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={clearFilters} className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                                    Clear Filters
                                </Button>
                                <Button onClick={() => router.push('/')} variant="ghost">
                                    Browse All
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
