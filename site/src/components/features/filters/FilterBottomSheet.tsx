"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Filter, 
  X, 
  Home, 
  Trees, 
  Building,
  BedDouble,
  Bath,
  Ruler
} from "lucide-react"
import { bottomSheetVariants, springPhysics } from "@/lib/motion/variants"

interface PropertyFilters {
  priceRange: [number, number]
  propertyTypes: string[]
  bedrooms: number[]
  bathrooms: number[]
  minArea: number
  maxArea: number
  locations: string[]
}

interface FilterBottomSheetProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  activeFilterCount?: number
}

export function FilterBottomSheet({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  activeFilterCount = 0
}: FilterBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const propertyTypes = [
    { id: 'house', label: 'House', icon: Home },
    { id: 'land', label: 'Land', icon: Trees },
    { id: 'commercial', label: 'Commercial', icon: Building },
  ]

  const bedroomOptions = [1, 2, 3, 4, 5]
  const bathroomOptions = [1, 2, 3, 4, 5]

  const handlePropertyTypeToggle = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type]
    
    onFiltersChange({ ...filters, propertyTypes: newTypes })
  }

  const handleBedroomToggle = (bedrooms: number) => {
    const newBedrooms = filters.bedrooms.includes(bedrooms)
      ? filters.bedrooms.filter(b => b !== bedrooms)
      : [...filters.bedrooms, bedrooms]
    
    onFiltersChange({ ...filters, bedrooms: newBedrooms })
  }

  const handleBathroomToggle = (bathrooms: number) => {
    const newBathrooms = filters.bathrooms.includes(bathrooms)
      ? filters.bathrooms.filter(b => b !== bathrooms)
      : [...filters.bathrooms, bathrooms]
    
    onFiltersChange({ ...filters, bathrooms: newBathrooms })
  }

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleAreaChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      onFiltersChange({ ...filters, minArea: value })
    } else {
      onFiltersChange({ ...filters, maxArea: value })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl border-t-0 bg-white/95 backdrop-blur-lg"
      >
        <motion.div
          variants={bottomSheetVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 100 || velocity.y > 500) {
              setIsOpen(false)
            }
          }}
          className="h-full flex flex-col"
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <SheetHeader className="px-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">Filter Properties</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-20">
            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Price Range</h3>
              <div className="space-y-3">
                <Slider
                  defaultValue={filters.priceRange}
                  max={100000000}
                  min={0}
                  step={1000000}
                  value={filters.priceRange}
                  onValueChange={handlePriceRangeChange}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>LKR {filters.priceRange[0].toLocaleString()}</span>
                  <span>LKR {filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {propertyTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = filters.propertyTypes.includes(type.id)
                  
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePropertyTypeToggle(type.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                Bedrooms
              </h3>
              <div className="flex flex-wrap gap-2">
                {bedroomOptions.map((bedrooms) => (
                  <motion.button
                    key={bedrooms}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBedroomToggle(bedrooms)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      filters.bedrooms.includes(bedrooms)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {bedrooms}+
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Bath className="h-5 w-5" />
                Bathrooms
              </h3>
              <div className="flex flex-wrap gap-2">
                {bathroomOptions.map((bathrooms) => (
                  <motion.button
                    key={bathrooms}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBathroomToggle(bathrooms)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      filters.bathrooms.includes(bathrooms)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {bathrooms}+
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Area (sq ft)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-area">Min</Label>
                  <input
                    id="min-area"
                    type="number"
                    value={filters.minArea}
                    onChange={(e) => handleAreaChange('min', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-area">Max</Label>
                  <input
                    id="max-area"
                    type="number"
                    value={filters.maxArea}
                    onChange={(e) => handleAreaChange('max', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Any"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-6">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClearFilters()
                  setIsOpen(false)
                }}
                className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Clear All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onApplyFilters()
                  setIsOpen(false)
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
              >
                Apply Filters ({activeFilterCount})
              </motion.button>
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}

// Sort Options Bottom Sheet
export function SortBottomSheet({
  currentSort,
  onSortChange,
}: {
  currentSort: string
  onSortChange: (sort: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const sortOptions = [
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'area-desc', label: 'Largest Area' },
    { id: 'area-asc', label: 'Smallest Area' },
  ]

  const handleSortSelect = (sortId: string) => {
    onSortChange(sortId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          Sort
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[70vh] rounded-t-3xl border-t-0 bg-white/95 backdrop-blur-lg"
      >
        <motion.div
          variants={bottomSheetVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="space-y-4"
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-center">Sort Properties</SheetTitle>
          </SheetHeader>

          <div className="space-y-2 pb-6">
            {sortOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSortSelect(option.id)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  currentSort === option.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}