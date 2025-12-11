"use client"

import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Grid } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageLightboxProps {
    images: string[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
    alt?: string
}

export function ImageLightbox({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    alt = "Property image"
}: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isZoomed, setIsZoomed] = useState(false)
    const [showThumbnails, setShowThumbnails] = useState(true)

    useEffect(() => {
        setCurrentIndex(initialIndex)
    }, [initialIndex])

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    onClose()
                    break
                case "ArrowLeft":
                    goToPrevious()
                    break
                case "ArrowRight":
                    goToNext()
                    break
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "auto"
        }
    }, [isOpen, currentIndex])

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setIsZoomed(false)
    }, [images.length])

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
        setIsZoomed(false)
    }, [images.length])

    const goToIndex = useCallback((index: number) => {
        setCurrentIndex(index)
        setIsZoomed(false)
    }, [])

    if (!isOpen || images.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/50" onClick={(e) => e.stopPropagation()}>
                    <div className="text-white/80 text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                            onClick={() => setShowThumbnails(!showThumbnails)}
                        >
                            <Grid className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Main Image Area */}
                <div
                    className="flex-1 flex items-center justify-center relative px-4 py-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    {/* Image */}
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "relative w-full h-full flex items-center justify-center",
                            isZoomed && "cursor-zoom-out"
                        )}
                        onClick={() => isZoomed && setIsZoomed(false)}
                    >
                        <div className={cn(
                            "relative transition-transform duration-300",
                            isZoomed ? "scale-150" : "scale-100",
                            "max-w-full max-h-full"
                        )}>
                            <Image
                                src={images[currentIndex]}
                                alt={`${alt} ${currentIndex + 1}`}
                                width={1200}
                                height={800}
                                className="object-contain max-h-[70vh] w-auto rounded-lg shadow-2xl"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={goToNext}
                            className="absolute right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Thumbnails */}
                <AnimatePresence>
                    {showThumbnails && images.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="px-4 py-4 bg-black/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex gap-2 overflow-x-auto justify-center">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToIndex(index)}
                                        className={cn(
                                            "relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all",
                                            index === currentIndex
                                                ? "ring-2 ring-emerald-500 opacity-100"
                                                : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}

// Hook to manage lightbox state
export function useLightbox() {
    const [isOpen, setIsOpen] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [initialIndex, setInitialIndex] = useState(0)

    const openLightbox = useCallback((imgArray: string[], startIndex = 0) => {
        setImages(imgArray)
        setInitialIndex(startIndex)
        setIsOpen(true)
    }, [])

    const closeLightbox = useCallback(() => {
        setIsOpen(false)
    }, [])

    return {
        isOpen,
        images,
        initialIndex,
        openLightbox,
        closeLightbox
    }
}
