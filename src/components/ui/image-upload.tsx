"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getStorage, BUCKETS } from "@/lib/appwrite/client"
import { ID } from "appwrite"
import { getAccount } from "@/lib/appwrite/client"

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    disabled?: boolean
}

export function ImageUpload({ value = [], onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const newUrls: string[] = []

        try {
            const maxImages = 10
            if (value.length >= maxImages) {
                toast.error("Maximum images reached", {
                    description: "You can upload up to 10 images."
                })
                return
            }

            // Ensure user is authenticated before uploading
            try {
                await getAccount().get()
            } catch (authError) {
                console.error("Authentication check failed:", authError)
                toast.error("Authentication required", {
                    description: "Please log in to upload images."
                })
                return
            }

            // Get storage instance
            const storage = getStorage()

            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) continue
                if (file.size > 10 * 1024 * 1024) {
                    toast.error("File too large", {
                        description: "Please upload images smaller than 10MB."
                    })
                    continue
                }

                try {
                    // Upload file to Appwrite Storage
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
                    if (value.length + newUrls.length >= maxImages) break
                } catch (uploadError) {
                    console.error("Failed to upload file:", file.name, uploadError)
                    toast.error(`Failed to upload ${file.name}`, {
                        description: uploadError instanceof Error ? uploadError.message : "Upload failed"
                    })
                }
            }

            if (newUrls.length > 0) {
                const combined = [...value, ...newUrls].slice(0, maxImages)
                onChange(combined)
                toast.success(`Uploaded ${newUrls.length} image${newUrls.length > 1 ? 's' : ''}`)
            }
        } catch (error) {
            console.error("Error uploading images:", error)
            console.error("Error details:", {
                bucketId: BUCKETS.LISTING_IMAGES,
                fileType: files?.[0]?.type,
                fileSize: files?.[0]?.size,
                errorType: error?.constructor?.name,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined
            })

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
                    toast.error("Authentication error", {
                        description: "Please log in again and try uploading."
                    })
                } else if (error.message.includes('413') || error.message.includes('size')) {
                    toast.error("File too large", {
                        description: "Please upload images smaller than 10MB."
                    })
                } else if (error.message.includes('bucket')) {
                    toast.error("Storage error", {
                        description: "Storage configuration issue. Please contact support."
                    })
                } else if (error.message.includes('permission')) {
                    toast.error("Permission denied", {
                        description: "You don't have permission to upload images."
                    })
                } else {
                    toast.error("Upload failed", {
                        description: error.message || "Something went wrong. Please try again."
                    })
                }
            } else {
                toast.error("Upload failed", {
                    description: "Something went wrong. Please try again."
                })
            }
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const onRemove = (url: string) => {
        const filtered = value.filter((v) => v !== url)
        onChange(filtered)
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
                            PNG, JPG, JPEG, WEBP, GIF up to 10MB each
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                        disabled={disabled || isUploading}
                    />
                </label>
            </div>
        </div>
    )
}