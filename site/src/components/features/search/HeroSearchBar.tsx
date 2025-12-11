"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function HeroSearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [type, setType] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams()
        if (query.trim()) params.set("query", query.trim())
        if (type && type !== "all") params.set("type", type)

        router.push(`/search?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSearch}>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl max-w-4xl mx-auto border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by City, District or Keyword..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 h-12 bg-white text-slate-900 border-none focus-visible:ring-emerald-500 font-medium"
                        />
                    </div>

                    <div className="flex-1">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full h-12 bg-white text-slate-900 border-none focus:ring-emerald-500 text-base">
                                <SelectValue placeholder="Property Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
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

                    <Button
                        type="submit"
                        size="lg"
                        aria-label="Search for properties by location and type"
                        className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 text-lg"
                    >
                        <Search className="mr-2 h-5 w-5" aria-hidden="true" /> Search
                    </Button>
                </div>
            </div>
        </form>
    )
}
