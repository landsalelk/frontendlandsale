"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ImageLightbox } from "@/components/ui/image-lightbox"
import { Camera } from "lucide-react"

interface PropertyImageGalleryProps {
    images: string[]
    title: string
    status: string
}

export function PropertyImageGallery({ images, title, status }: PropertyImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)

    const openLightbox = (index: number) => {
        setLightboxIndex(index)
        setLightboxOpen(true)
    }

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div
                    className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative border cursor-pointer group"
                    onClick={() => openLightbox(0)}
                >
                    <Image
                        src={images[0]}
                        alt={title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-4 left-4 bg-emerald-600">
                        {status === 'active' ? 'FOR SALE' : status.toUpperCase()}
                    </Badge>

                    {/* View All Photos Button */}
                    {images.length > 1 && (
                        <button
                            className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-white transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                openLightbox(0)
                            }}
                        >
                            <Camera className="h-4 w-4" />
                            View All ({images.length})
                        </button>
                    )}
                </div>

                {/* Thumbnail Grid */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                        {images.slice(1, 5).map((img: string, idx: number) => (
                            <div
                                key={idx}
                                className="aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 border relative group"
                                onClick={() => openLightbox(idx + 1)}
                            >
                                <Image
                                    src={img}
                                    alt={`${title} - View ${idx + 2}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Show "more" overlay on 4th thumbnail if more images exist */}
                                {idx === 3 && images.length > 5 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">+{images.length - 5} more</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <ImageLightbox
                images={images}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                alt={title}
            />
        </>
    )
}
