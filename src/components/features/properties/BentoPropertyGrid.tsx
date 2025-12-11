"use client"

import { motion } from "framer-motion"
import { Property } from "@/components/features/properties/InteractivePropertyCard"
import { InteractivePropertyCard } from "@/components/features/properties/InteractivePropertyCard"
import {
  staggerContainerVariants,
  cardVariants,
  springPhysics
} from "@/lib/motion/variants"

interface BentoPropertyGridProps {
  properties: Property[]
  onMapPinHover?: (pinId: string) => void
  onMapPinLeave?: () => void
  className?: string
}

export function BentoPropertyGrid({
  properties,
  onMapPinHover,
  onMapPinLeave,
  className = ""
}: BentoPropertyGridProps) {
  // Determine if a property should be featured based on price, type, or explicit flag
  const isFeaturedProperty = (property: Property) => {
    return property.featured || property.price > 50000000 // Properties over 50M LKR
  }

  // Calculate grid item span based on property characteristics
  const getGridSpan = (property: Property, index: number) => {
    if (isFeaturedProperty(property)) {
      return "col-span-2 row-span-2" // 2x2 for featured properties
    }

    // Create visual rhythm with alternating spans
    if (index % 5 === 0) return "col-span-2 row-span-1" // Wide cards
    if (index % 7 === 0) return "col-span-1 row-span-2" // Tall cards

    return "col-span-1 row-span-1" // Standard cards
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={`container mx-auto px-4 py-8 ${className}`}
    >
      {/* Desktop Bento Grid */}
      <div className="hidden lg:grid lg:grid-cols-6 lg:gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            variants={cardVariants}
            custom={index}
            className={getGridSpan(property, index)}
          >
            <InteractivePropertyCard
              property={property}
            />
          </motion.div>
        ))}
      </div>

      {/* Tablet Grid */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:hidden">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            variants={cardVariants}
            custom={index}
            className={index % 3 === 0 ? "col-span-2" : "col-span-1"}
          >
            <InteractivePropertyCard
              property={property}
            />
          </motion.div>
        ))}
      </div>

      {/* Mobile Single Column */}
      <div className="grid grid-cols-1 gap-6 md:hidden">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            variants={cardVariants}
            custom={index}
          >
            <InteractivePropertyCard
              property={property}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Alternative Fluid Grid with more dynamic sizing
export function FluidPropertyGrid({
  properties,
  onMapPinHover,
  onMapPinLeave,
  className = ""
}: BentoPropertyGridProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={`container mx-auto px-4 py-8 ${className}`}
    >
      {/* Masonry-style grid for desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:auto-rows-auto">
        {properties.map((property, index) => {
          // Create flowing, organic layout
          const rowSpan = property.featured ? "row-span-3" :
            index % 4 === 0 ? "row-span-2" : "row-span-1"
          const colSpan = property.featured ? "col-span-6" :
            index % 3 === 0 ? "col-span-4" : "col-span-3"

          return (
            <motion.div
              key={property.id}
              variants={cardVariants}
              custom={index}
              className={`${colSpan} ${rowSpan}`}
            >
              <InteractivePropertyCard
                property={property}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Simplified tablet layout */}
      <div className="hidden md:grid md:grid-cols-8 md:gap-4 lg:hidden">
        {properties.map((property, index) => {
          const span = index % 2 === 0 ? "col-span-5" : "col-span-3"

          return (
            <motion.div
              key={property.id}
              variants={cardVariants}
              custom={index}
              className={span}
            >
              <InteractivePropertyCard
                property={property}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Mobile stack */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            variants={cardVariants}
            custom={index}
          >
            <InteractivePropertyCard
              property={property}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}