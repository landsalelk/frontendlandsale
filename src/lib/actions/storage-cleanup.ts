'use server'

import { createAdminClient } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS, BUCKETS } from "@/lib/appwrite/config"
import { Query } from "node-appwrite"

/**
 * Utility function to extract file ID from Appwrite storage URL
 */
export function extractFileIdFromUrl(url: string): string | null {
    const match = url.match(/files\/([a-zA-Z0-9]+)\//)
    return match ? match[1] : null
}

/**
 * Clean up orphaned files in storage that are no longer referenced in database
 * This function should be run periodically or as a maintenance task
 */
export async function cleanupOrphanedFiles(): Promise<{
    deleted: number
    errors: number
    orphaned: string[]
}> {
    try {
        const { databases, storage } = await createAdminClient()
        
        let deleted = 0
        let errors = 0
        const orphaned: string[] = []

        // Get all files from listing_images bucket
        const listingFiles = await storage.listFiles(BUCKETS.LISTING_IMAGES)
        
        for (const file of listingFiles.files) {
            try {
                // Check if this file is referenced in any listing
                const listingsWithImage = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.LISTINGS,
                    [Query.contains('images', file.$id)]
                )
                
                if (listingsWithImage.documents.length === 0) {
                    // File is orphaned, delete it
                    try {
                        await storage.deleteFile(BUCKETS.LISTING_IMAGES, file.$id)
                        deleted++
                        orphaned.push(file.$id)
                        console.log(`Deleted orphaned file: ${file.$id}`)
                    } catch (deleteError) {
                        errors++
                        console.warn(`Failed to delete orphaned file: ${file.$id}`, deleteError)
                    }
                }
            } catch (checkError) {
                console.warn(`Error checking file ${file.$id}:`, checkError)
                errors++
            }
        }

        // Get all files from user_avatars bucket
        const avatarFiles = await storage.listFiles(BUCKETS.USER_AVATARS)
        
        for (const file of avatarFiles.files) {
            try {
                // Check if this file is referenced in any user profile
                const usersWithAvatar = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS_EXTENDED,
                    [Query.contains('avatar_url', file.$id)]
                )
                
                if (usersWithAvatar.documents.length === 0) {
                    // File is orphaned, delete it
                    try {
                        await storage.deleteFile(BUCKETS.USER_AVATARS, file.$id)
                        deleted++
                        orphaned.push(file.$id)
                        console.log(`Deleted orphaned avatar: ${file.$id}`)
                    } catch (deleteError) {
                        errors++
                        console.warn(`Failed to delete orphaned avatar: ${file.$id}`, deleteError)
                    }
                }
            } catch (checkError) {
                console.warn(`Error checking avatar ${file.$id}:`, checkError)
                errors++
            }
        }

        return { deleted, errors, orphaned }
    } catch (error) {
        console.error("Cleanup error:", error)
        return { deleted: 0, errors: 1, orphaned: [] }
    }
}

/**
 * Validate that all referenced files in database actually exist in storage
 * Returns files that are referenced but missing from storage
 */
export async function validateFileReferences(): Promise<{
    missing: string[]
    valid: number
}> {
    try {
        const { databases, storage } = await createAdminClient()
        
        const missing: string[] = []
        let valid = 0

        // Get all listings with images
        const listingsWithImages = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [Query.notEqual('images', [])]
        )
        
        for (const listing of listingsWithImages.documents) {
            if (listing.images && Array.isArray(listing.images)) {
                for (const imageUrl of listing.images) {
                    const fileId = extractFileIdFromUrl(imageUrl)
                    if (fileId) {
                        try {
                            await storage.getFile(BUCKETS.LISTING_IMAGES, fileId)
                            valid++
                        } catch (error) {
                            missing.push(fileId)
                            console.warn(`Missing image file: ${fileId} from listing ${listing.$id}`)
                        }
                    }
                }
            }
        }

        // Get all users with avatars
        const usersWithAvatars = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS_EXTENDED
        )
        
        for (const user of usersWithAvatars.documents) {
            if (user.avatar_url) {
                const fileId = extractFileIdFromUrl(user.avatar_url)
                if (fileId) {
                    try {
                        await storage.getFile(BUCKETS.USER_AVATARS, fileId)
                        valid++
                    } catch (error) {
                        missing.push(fileId)
                        console.warn(`Missing avatar file: ${fileId} from user ${user.$id}`)
                    }
                }
            }
        }

        return { missing, valid }
    } catch (error) {
        console.error("Validation error:", error)
        return { missing: [], valid: 0 }
    }
}