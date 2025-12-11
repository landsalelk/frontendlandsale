'use server'

import { getCurrentUser, createSessionClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query } from "node-appwrite"

export interface PropertyAnalytics {
    propertyId: string
    title: string
    views: number
    favorites: number
    inquiries: number
    status: string
    createdAt: string
}

export interface DashboardStats {
    totalProperties: number
    totalViews: number
    totalFavorites: number
    totalInquiries: number
    unreadInquiries: number
    activeListings: number
    pendingListings: number
}

/**
 * Get overall dashboard statistics for the current user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    const user = await getCurrentUser()

    if (!user) {
        return {
            totalProperties: 0,
            totalViews: 0,
            totalFavorites: 0,
            totalInquiries: 0,
            unreadInquiries: 0,
            activeListings: 0,
            pendingListings: 0
        }
    }

    try {
        const { databases } = await createSessionClient()

        // Fetch properties with their stats
        const propertiesResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [Query.equal('user_id', user.$id)]
        )
        const properties = propertiesResponse.documents

        // Count favorites for user's properties
        const propertyIds = properties.map(p => p.$id)
        let favoritesCount = 0
        if (propertyIds.length > 0) {
            for (const propId of propertyIds) {
                const favResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.FAVORITES,
                    [Query.equal('listing_id', propId)]
                )
                favoritesCount += favResponse.total
            }
        }

        // Note: Inquiries collection may not exist yet - return 0 for now
        const inquiriesCount = 0
        const unreadCount = 0

        const totalViews = properties.reduce((sum, p) => sum + (p.views_count || 0), 0)
        const activeListings = properties.filter(p => p.status === 'active').length
        const pendingListings = properties.filter(p => p.status === 'pending').length

        return {
            totalProperties: properties.length,
            totalViews,
            totalFavorites: favoritesCount,
            totalInquiries: inquiriesCount,
            unreadInquiries: unreadCount,
            activeListings,
            pendingListings
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            totalProperties: 0,
            totalViews: 0,
            totalFavorites: 0,
            totalInquiries: 0,
            unreadInquiries: 0,
            activeListings: 0,
            pendingListings: 0
        }
    }
}

/**
 * Get per-property analytics for the current user
 */
export async function getPropertyAnalytics(): Promise<PropertyAnalytics[]> {
    const user = await getCurrentUser()
    if (!user) return []

    try {
        const { databases } = await createSessionClient()

        // Fetch all user properties
        const propertiesResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('user_id', user.$id),
                Query.orderDesc('$createdAt')
            ]
        )
        const properties = propertiesResponse.documents

        if (properties.length === 0) return []

        // Build analytics with favorites count
        const analytics: PropertyAnalytics[] = []

        for (const p of properties) {
            // Count favorites for this property
            let favCount = 0
            try {
                const favResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.FAVORITES,
                    [Query.equal('listing_id', p.$id)]
                )
                favCount = favResponse.total
            } catch {
                // Favorites may not exist for this property
            }

            // Parse title from JSON for display
            let titleText = 'Untitled'
            try {
                const parsed = JSON.parse(p.title || '{}')
                titleText = parsed.en || 'Untitled'
            } catch {
                titleText = 'Untitled'
            }

            analytics.push({
                propertyId: p.$id,
                title: titleText,
                views: p.views_count || 0,
                favorites: favCount,
                inquiries: 0, // Inquiries collection not yet implemented
                status: p.status,
                createdAt: p.$createdAt
            })
        }

        return analytics
    } catch (error) {
        console.error("Error fetching property analytics:", error)
        return []
    }
}

/**
 * Get top performing properties
 */
export async function getTopProperties(limit: number = 5): Promise<PropertyAnalytics[]> {
    const analytics = await getPropertyAnalytics()

    // Sort by views (primary) and inquiries (secondary)
    return analytics
        .sort((a, b) => {
            const scoreA = a.views + (a.inquiries * 10) + (a.favorites * 5)
            const scoreB = b.views + (b.inquiries * 10) + (b.favorites * 5)
            return scoreB - scoreA
        })
        .slice(0, limit)
}
