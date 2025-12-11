"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { getStorage, BUCKETS } from "@/lib/appwrite/client"
import { ID } from "appwrite"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    onRemove: (value: string) => void
}

export function ImageUpload({
    value,
    onChange,
    onRemove
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const storage = getStorage()

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const newUrls: string[] = []

        try {
            for (const file of Array.from(files)) {
                // simple validation
                if (!file.type.startsWith("image/")) continue;

                // Upload to Appwrite Storage
                const result = await storage.createFile(
                    BUCKETS.LISTING_IMAGES,
                    ID.unique(),
                    file
                )

                // Get the file URL
                const fileUrl = storage.getFileView(
                    BUCKETS.LISTING_IMAGES,
                    result.$id
                )

                newUrls.push(fileUrl.toString())
            }

            if (newUrls.length > 0) {
                onChange([...value, ...newUrls])
            }
        } catch (error) {
            console.error("Error uploading images:", error)

            if (error instanceof Error) {
                if (error.message.includes('network')) {
                    toast.error("Network error", {
                        description: "Please check your internet connection and try again."
                    })
                } else if (error.message.includes('timeout')) {
                    toast.error("Upload timeout", {
                        description: "The upload is taking too long. Please try again with smaller images."
                    })
                } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                    toast.error("Upload failed", {
                        description: "Please log in again to continue uploading images."
                    })
                } else if (error.message.includes('413') || error.message.includes('size')) {
                    toast.error("File too large", {
                        description: "Please upload images smaller than 5MB."
                    })
                } else {
                    toast.error("Upload failed", {
                        description: error.message || "An unexpected error occurred. Please try again."
                    })
                }
            } else {
                toast.error("Upload failed", {
                    description: "Something went wrong during upload. Please try again."
                })
            }
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {value.map((url) => (
                    <div key={url} className="relative aspect-video rounded-lg overflow-hidden border bg-slate-100 group">
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            src={url}
                            alt="Property Image"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-300 dark:border-slate-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-2" />
                        ) : (
                            <ImagePlus className="h-8 w-8 text-slate-400 mb-2" />
                        )}
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            SVG, PNG, JPG or GIF
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={onUpload}
                        disabled={isUploading}
                    />
                </label>
            </div>
        </div>
    )
}
