"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { MessageCircle, Phone, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const dockVariants: Variants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
        }
    },
    exit: { y: 100, opacity: 0 }
}

const buttonTap = { scale: 0.9, transition: { type: "spring", stiffness: 400, damping: 10 } } as const

export function MobileActionDock() {
    // Only show on mobile/tablet
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const checkVisibility = () => {
            // Show if window width < 768px (md breakpoint)
            setIsVisible(window.innerWidth < 768)
        }

        checkVisibility()
        window.addEventListener("resize", checkVisibility)
        return () => window.removeEventListener("resize", checkVisibility)
    }, [])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={cn(
                        "fixed bottom-4 left-4 right-4 z-50",
                        "flex items-center justify-between gap-3",
                        "p-2 rounded-2xl",
                        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-2xl"
                    )}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dockVariants}
                >
                    {/* WhatsApp Button */}
                    <motion.a
                        href="https://wa.me/" // Placeholder
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={buttonTap}
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl",
                            "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                            "hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        )}
                        aria-label="Contact via WhatsApp"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </motion.a>

                    {/* Book Visit - Primary Action */}
                    <motion.button
                        whileTap={buttonTap}
                        className={cn(
                            "flex-1 h-12 rounded-xl",
                            "bg-slate-900 text-white dark:bg-emerald-600",
                            "shadow-lg flex items-center justify-center gap-2 font-semibold text-sm",
                            "hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors"
                        )}
                    >
                        <CalendarCheck className="w-5 h-5" />
                        <span>Book Visit</span>
                    </motion.button>

                    {/* Call Button */}
                    <motion.a
                        href="tel:+"
                        whileTap={buttonTap}
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl",
                            "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                            "hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        )}
                        aria-label="Call Agent"
                    >
                        <Phone className="w-6 h-6" />
                    </motion.a>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
