"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MessageCircle, Calendar, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  floatingVariants, 
  iconVariants, 
  springPhysics,
  gentleSpring 
} from "@/lib/motion/variants"

interface FloatingBottomActionDockProps {
  propertyId: string
  propertyTitle: string
  agentPhone?: string
  agentWhatsApp?: string
  onBookVisit?: () => void
  className?: string
}

export function FloatingBottomActionDock({
  propertyId,
  propertyTitle,
  agentPhone = "+94771234567",
  agentWhatsApp = "+94771234567",
  onBookVisit,
  className = ""
}: FloatingBottomActionDockProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Show dock after initial load
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    // Handle scroll for dock behavior
    const handleScroll = () => {
      const scrolled = window.scrollY > 100
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handlePhoneCall = () => {
    window.open(`tel:${agentPhone}`, '_self')
  }

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in ${propertyTitle}`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${agentWhatsApp.replace('+', '')}?text=${encodedMessage}`, '_blank')
  }

  const handleBookVisit = () => {
    if (onBookVisit) {
      onBookVisit()
    } else {
      // Default booking behavior - could open a modal or navigate to booking page
      console.log(`Booking visit for property: ${propertyTitle}`)
    }
  }

  const handleSaveProperty = () => {
    // Implement save/favorite functionality
    console.log(`Saving property: ${propertyTitle}`)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          exit="initial"
          className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              ...springPhysics,
              delay: 0.5,
            }}
            className="mx-auto max-w-md"
          >
            {/* Main Action Dock */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-3 shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                {/* WhatsApp Button */}
                <motion.button
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </motion.button>

                {/* Book Visit Button - Primary Action */}
                <motion.button
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleBookVisit}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="Book a Visit"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Book Visit</span>
                </motion.button>

                {/* Call Button */}
                <motion.button
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handlePhoneCall}
                  className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="Call Agent"
                >
                  <Phone className="h-5 w-5" />
                </motion.button>

                {/* Save/Favorite Button */}
                <motion.button
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleSaveProperty}
                  className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  title="Save Property"
                >
                  <Heart className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Optional: Additional quick actions that can expand */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: isScrolled ? "auto" : 0, opacity: isScrolled ? 1 : 0 }}
              transition={gentleSpring}
              className="mt-2 overflow-hidden"
            >
              <div className="bg-white/60 backdrop-blur-sm border border-white/10 rounded-xl p-2">
                <div className="text-xs text-gray-600 text-center">
                  Quick actions available
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Alternative minimal version for property listings
export function MinimalFloatingDock({
  onBookVisit,
  className = ""
}: { onBookVisit?: () => void; className?: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          exit="initial"
          className={`fixed bottom-4 left-4 right-4 z-40 ${className}`}
        >
          <div className="mx-auto max-w-xs">
            <motion.button
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={onBookVisit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Book Visit</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}