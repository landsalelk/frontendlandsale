"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation } from "lucide-react"
import { mapPinVariants, springPhysics } from "@/lib/motion/variants"
import { Property, InteractivePropertyCard } from "@/components/features/properties/InteractivePropertyCard"

export interface MapPinData {
  id: string
  lat: number
  lng: number
  propertyId: string
  price: number
  title: string
  type: 'land' | 'house' | 'commercial'
  featured?: boolean
}

interface InteractiveMapProps {
  pins: MapPinData[]
  hoveredPinId?: string
  onPinHover?: (pinId: string) => void
  onPinLeave?: () => void
  onPinClick?: (pin: MapPinData) => void
  className?: string
  center?: { lat: number; lng: number }
  zoom?: number
}

// Mock map component - in production, integrate with Google Maps, Mapbox, or Leaflet
export function InteractivePropertyMap({
  pins,
  hoveredPinId,
  onPinHover,
  onPinLeave,
  onPinClick,
  className = "",
}: InteractiveMapProps) {
  const [selectedPin, setSelectedPin] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handlePinHover = (pinId: string) => {
    setSelectedPin(pinId)
    if (onPinHover) {
      onPinHover(pinId)
    }
  }

  // Sync with Property Cards via Window Event
  useEffect(() => {
    const handlePropertyHover = (e: CustomEvent<{ id: string | null }>) => {
      setSelectedPin(e.detail.id)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('property-hover', handlePropertyHover as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('property-hover', handlePropertyHover as EventListener)
      }
    }
  }, [])

  const handlePinLeave = () => {
    setSelectedPin(null)
    if (onPinLeave) {
      onPinLeave()
    }
  }

  const handlePinClick = (pin: MapPinData) => {
    if (onPinClick) {
      onPinClick(pin)
    }
  }

  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `LKR ${(price / 1000000).toFixed(1)}M`
    }
    return `LKR ${(price / 1000).toFixed(0)}K`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPhysics}
      className={`relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl overflow-hidden shadow-xl ${className}`}
    >
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200">
        {/* Grid pattern to simulate map texture */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:bg-white transition-colors"
            title="Zoom In"
          >
            <span className="text-lg font-bold text-gray-700">+</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:bg-white transition-colors"
            title="Zoom Out"
          >
            <span className="text-lg font-bold text-gray-700">−</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:bg-white transition-colors"
            title="My Location"
          >
            <Navigation className="h-4 w-4 text-gray-700" />
          </motion.button>
        </div>

        {/* Map Type Toggle */}
        <div className="absolute top-4 left-4 z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPhysics, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg"
          >
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md">
                Map
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                Satellite
              </button>
            </div>
          </motion.div>
        </div>

        {/* Property Pins */}
        <div className="absolute inset-0">
          {pins.map((pin, index) => {
            const isHovered = hoveredPinId === pin.id || selectedPin === pin.id
            const position = {
              left: `${20 + (index * 15) % 60}%`,
              top: `${20 + (index * 20) % 50}%`
            }

            return (
              <motion.div
                key={pin.id}
                className="absolute"
                style={position}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  ...springPhysics,
                  delay: 0.1 * index,
                }}
              >
                {/* Price Label */}
                <motion.div
                  variants={mapPinVariants}
                  initial="initial"
                  animate={isHovered ? "hover" : "initial"}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
                >
                  <div className={`bg-white rounded-lg px-2 py-1 shadow-lg border-2 ${pin.featured ? 'border-amber-400' : 'border-gray-200'
                    }`}>
                    <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {formatPrice(pin.price)}
                    </span>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2">
                    <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${pin.featured ? 'border-t-amber-400' : 'border-t-gray-200'
                      }`} />
                  </div>
                </motion.div>

                {/* Map Pin */}
                <motion.button
                  variants={mapPinVariants}
                  initial="initial"
                  animate={isHovered ? "hover" : "initial"}
                  onHoverStart={() => handlePinHover(pin.id)}
                  onHoverEnd={handlePinLeave}
                  onClick={() => handlePinClick(pin)}
                  className={`relative group ${isHovered ? 'z-10' : 'z-0'
                    }`}
                >
                  <div className={`relative ${pin.featured ? 'scale-125' : 'scale-100'
                    } transition-transform duration-300`}>
                    {/* Pin Shadow */}
                    <div className="absolute inset-0 bg-black/20 rounded-full blur-sm transform translate-y-1" />

                    {/* Pin Icon */}
                    <div className={`relative ${pin.type === 'land' ? 'bg-green-500' :
                      pin.type === 'commercial' ? 'bg-blue-500' :
                        'bg-red-500'
                      } rounded-full p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 ${isHovered ? 'ring-4 ring-white/50' : ''
                      }`}>
                      <MapPin className="h-4 w-4 text-white" />
                    </div>

                    {/* Pulse Effect for Featured */}
                    {pin.featured && (
                      <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20" />
                    )}
                  </div>
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* Map Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPhysics, delay: 0.5 }}
          className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg"
        >
          <div className="text-xs font-semibold text-gray-700 mb-2">Property Types</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-xs text-gray-600">Houses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-600">Land</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-600">Commercial</span>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Component for property listings with map integration
export function PropertyListingWithMap({
  properties,
  className = ""
}: {
  properties: Property[]
  className?: string
}) {
  const [hoveredPinId, setHoveredPinId] = useState<string | undefined>(undefined)

  // Convert properties to map pins
  const mapPins: MapPinData[] = properties.map((property, index) => ({
    id: property.id,
    lat: 6.9271 + (index * 0.01), // Mock coordinates
    lng: 79.8612 + (index * 0.01), // Mock coordinates
    propertyId: property.id,
    price: property.price,
    title: property.title,
    type: property.type,
    featured: property.featured
  }))

  const handleCardHover = (pinId: string) => {
    setHoveredPinId(pinId)
  }

  const handleCardLeave = () => {
    setHoveredPinId(undefined)
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {/* Property List */}
      <div className="space-y-6">
        {properties.map((property, index) => (
          <InteractivePropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>

      {/* Interactive Map */}
      <div className="lg:sticky lg:top-8 h-fit">
        <InteractivePropertyMap
          pins={mapPins}
          hoveredPinId={hoveredPinId}
          className="h-[600px]"
        />
      </div>
    </div>
  )
}