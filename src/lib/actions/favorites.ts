'use server'

import { getCurrentUser, createSessionClient } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config"
import { revalidatePath } from "next/cache"
import { ID, Query } from "node-appwrite"
import { transformListingToProperty } from "@/lib/utils"

export type FavoriteActionState = {
    error?: string
    success?: boolean
    isFavorited?: boolean
}

/**
 * Toggle a property as favorite for the current user
 */
export async function toggleFavorite(propertyId: string): Promise<FavoriteActionState> {
    const user = await getCurrentUser()

    if (!user) {
        return { error: "You must be logged in to save favorites" }
    }

    try {
        const { databases } = await createSessionClient()

        // Check if already favorited
        const existingFavorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [
                Query.equal('user_id', user.$id),
                Query.equal('property_id', propertyId)
            ]
        )

        if (existingFavorites.documents.length > 0) {
            // Remove from favorites
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTIONS.FAVORITES,
                existingFavorites.documents[0].$id
            )

            revalidatePath('/dashboard/favorites')
            return { success: true, isFavorited: false }
        } else {
            // Add to favorites
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.FAVORITES,
                ID.unique(),
                {
                    user_id: user.$id,
                    property_id: propertyId
                }
            )

            revalidatePath('/dashboard/favorites')
            return { success: true, isFavorited: true }
        }
    } catch (error: any) {
        console.error("Error toggling favorite:", error)
        return { error: "Failed to update favorites" }
    }
}

/**
 * Check if a property is favorited by the current user
 */
export async function checkIsFavorited(propertyId: string): Promise<boolean> {
    const user = await getCurrentUser()
    if (!user) return false

    try {
        const { databases } = await createSessionClient()

        const favorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [
                Query.equal('user_id', user.$id),
                Query.equal('property_id', propertyId)
            ]
        )

        return favorites.documents.length > 0
    } catch (error) {
        console.error("Error checking favorite:", error)
        return false
    }
}

/**
 * Get all favorited properties for the current user
 */
export async function getUserFavorites() {
    const user = await getCurrentUser()
    if (!user) return []

    try {
        const { databases } = await createSessionClient()

        // Get all favorites for the user
        const favorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [
                Query.equal('user_id', user.$id),
                Query.orderDesc('$createdAt')
            ]
        )

        // For each favorite, fetch the property details
        const propertiesWithFavorites = await Promise.all(
            favorites.documents.map(async (fav) => {
                try {
                    const listing = await databases.getDocument(
                        DATABASE_ID,
                        COLLECTIONS.LISTINGS,
                        fav.property_id
                    )
                    const property = transformListingToProperty(listing)
                    return {
                        id: fav.$id,
                        created_at: fav.$createdAt,
                        properties: {
                            id: property.$id,
                            title: property.title,
                            price: property.price,
                            city: property.city,
                            district: property.district,
                            type: property.type,
                            size: property.size,
                            bedrooms: property.bedrooms,
                            bathrooms: property.bathrooms,
                            images: property.images,
                            status: property.status
                        }
                    }
                } catch {
                    // Property might have been deleted
                    return null
                }
            })
        )

        return propertiesWithFavorites.filter(Boolean)
    } catch (error) {
        console.error("Error fetching favorites:", error)
        return []
    }
}

/**
 * Get favorite property IDs for the current user (for quick lookup)
 */
export async function getUserFavoriteIds(): Promise<string[]> {
    const user = await getCurrentUser()
    if (!user) return []

    try {
        const { databases } = await createSessionClient()

        const favorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [Query.equal('user_id', user.$id)]
        )

        return favorites.documents.map(f => f.property_id)
    } catch (error) {
        console.error("Error fetching favorite IDs:", error)
        return []
    }
}
