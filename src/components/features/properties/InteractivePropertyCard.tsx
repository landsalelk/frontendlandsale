"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, PanInfo, Variants } from "framer-motion"
import { Bed, Bath, Ruler, MapPin, Heart, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn, formatPrice, getPropertyImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { VerifiedBadge } from "./VerifiedBadge"

// Types
export interface Property {
  id: string
  title: string
  price: number
  images: string[]
  bedrooms?: number
  bathrooms?: number
  size?: string // e.g. "10.5 Perches"
  city: string
  district: string
  type: "land" | "house" | "commercial"
  featured?: boolean
  views?: number
  verified?: boolean // "Verified by Landsale" status
}

interface InteractivePropertyCardProps {
  property: Property
  className?: string
}

// Animation Constants
const SPRING_BOUNCE = { type: "spring", stiffness: 260, damping: 20, mass: 1 } as const
const GENTLE_SPRING = { type: "spring", stiffness: 200, damping: 25 } as const

const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...GENTLE_SPRING,
      staggerChildren: 0.1
    }
  },
  hover: {
    y: -12,
    transition: SPRING_BOUNCE
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  }
}

const imageVariants: Variants = {
  hover: { scale: 1.05, transition: { duration: 0.8, ease: "easeOut" } }
}

const iconVariants: Variants = {
  hover: {
    rotate: 15,
    scale: 1.2,
    transition: { type: "spring", stiffness: 300, damping: 10 }
  }
}

const textRevealVariants: Variants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { ...GENTLE_SPRING, delay: 0.2 } }
}

export const InteractivePropertyCard = React.memo(({ property, className }: InteractivePropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)


  // Check for touch device to disable some hover effects
  useEffect(() => {
    const checkTouch = () => setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches)
    checkTouch()
    window.addEventListener("resize", checkTouch)
    return () => window.removeEventListener("resize", checkTouch)
  }, [])

  // Image Swiping Logic
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x < -threshold) {
      // Swipe Left -> Next Image
      if (currentImageIndex < (property.images.length || 0) - 1) {
        setCurrentImageIndex(prev => prev + 1)
      }
    } else if (info.offset.x > threshold) {
      // Swipe Right -> Prev Image
      if (currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1)
      }
    }
  }

  const displayImages = property.images && property.images.length > 0
    ? property.images
    : ["/placeholder-property.jpg"]

  return (
    <Link href={`/properties/${property.id}`} className="block h-full">
      <motion.div
        ref={containerRef}
        initial="initial"
        animate="animate"
        whileHover={!isTouchDevice ? "hover" : undefined}
        whileTap="tap"
        variants={cardVariants}
        onHoverStart={() => {
          setIsHovered(true)
          // Dispatch event for Map Sync
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('property-hover', { detail: { id: property.id } }))
          }
        }}
        onHoverEnd={() => {
          setIsHovered(false)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('property-hover', { detail: { id: null } }))
          }
        }}
        className={cn(
          "group relative bg-card rounded-3xl overflow-hidden border border-border/50 shadow-xl cursor-pointer",
          "h-full flex flex-col will-change-transform backface-hidden",
          className
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <motion.div
            className="flex h-full w-full cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            variants={imageVariants}
          >
            <motion.div
              className="flex w-full h-full"
              animate={{ x: `-${currentImageIndex * 100}%` }}
              transition={SPRING_BOUNCE}
            >
              {displayImages.map((src, index) => (
                <div key={index} className="relative min-w-full h-full">
                  <Image
                    src={getPropertyImageUrl(src)}
                    alt={`${property.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Overlays */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md",
                property.type === 'land' ? "bg-green-500/90 text-white" :
                  property.type === 'house' ? "bg-blue-500/90 text-white" :
                    "bg-slate-900/90 text-white"
              )}
            >
              {property.type}
            </motion.div>
            {property.verified && <VerifiedBadge />}
          </div>

          <div className="absolute top-4 right-4 z-10">
            <motion.button
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Pagination Dots */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {displayImages.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm",
                    idx === currentImageIndex && "bg-white w-3"
                  )}
                  animate={{
                    scale: idx === currentImageIndex ? 1 : 0.8,
                    width: idx === currentImageIndex ? 16 : 6
                  }}
                  layout
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow bg-white dark:bg-slate-950/50 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="overflow-hidden">
              <motion.h3 className="text-lg font-bold text-foreground line-clamp-1">
                {property.title.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      initial: { y: "100%" },
                      animate: { y: 0, transition: { ...GENTLE_SPRING, delay: 0.2 + (i * 0.05) } }
                    }}
                    className="inline-block mr-1"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h3>
            </div>
          </div>

          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <motion.div variants={iconVariants}>
              <MapPin className="w-4 h-4 mr-1 text-primary/80" />
            </motion.div>
            <span className="truncate">{property.city}, {property.district}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {property.type !== 'land' && (
              <>
                {property.bedrooms && (
                  <div className="flex items-center gap-1.5 text-sm text-foreground/80 group/icon">
                    <motion.div variants={iconVariants}>
                      <Bed className="w-4 h-4 text-slate-500 group-hover/icon:text-blue-500 transition-colors" />
                    </motion.div>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1.5 text-sm text-foreground/80 group/icon">
                    <motion.div variants={iconVariants}>
                      <Bath className="w-4 h-4 text-slate-500 group-hover/icon:text-blue-500 transition-colors" />
                    </motion.div>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                )}
              </>
            )}
            {property.size && (
              <div className="flex items-center gap-1.5 text-sm text-foreground/80 group/icon">
                <motion.div variants={iconVariants}>
                  <Ruler className="w-4 h-4 text-slate-500 group-hover/icon:text-emerald-500 transition-colors" />
                </motion.div>
                <span className="font-medium">{property.size}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-dashed border-border/60 flex items-center justify-between">
            <div className="overflow-hidden">
              {/* Price Ticker Animation */}
              <div className="flex overflow-hidden text-xl font-bold text-primary">
                {Array.from("LKR " + formatPrice(property.price)).map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.1 + (index * 0.03)
                    }}
                    className="inline-block whitespace-pre"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>
            {property.views !== undefined && property.views > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                <Eye className="w-3 h-3" />
                <span>{property.views}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
})

InteractivePropertyCard.displayName = "InteractivePropertyCard"