"use server"

import { createAdminClient } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config"
import { Query } from "node-appwrite"

export async function getRegions() {
    try {
        const { databases } = await createAdminClient()
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.REGIONS,
            [
                Query.equal('is_active', true),
                Query.orderAsc('name'),
                Query.limit(100)
            ]
        )

        return response.documents.map(doc => ({
            id: doc.$id,
            name: doc.name,
            slug: doc.slug,
        }))
    } catch (error) {
        console.error("Error fetching regions:", error)
        return []
    }
}

export async function getCitiesByRegion(regionId: string) {
    try {
        const { databases } = await createAdminClient()
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITIES,
            [
                Query.equal('region_id', regionId),
                Query.equal('is_active', true),
                Query.orderAsc('name'),
                Query.limit(500)
            ]
        )

        return response.documents.map(doc => ({
            id: doc.$id,
            name: doc.name,
            slug: doc.slug,
        }))
    } catch (error) {
        console.error("Error fetching cities:", error)
        return []
    }
}

export async function searchCities(regionId: string, query: string) {
    if (!query || query.length < 2) return []

    try {
        const { databases } = await createAdminClient()
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITIES,
            [
                Query.equal('region_id', regionId),
                Query.equal('is_active', true),
                Query.startsWith('name', query),
                Query.orderAsc('name'),
                Query.limit(10)
            ]
        )

        return response.documents.map(doc => ({
            id: doc.$id,
            name: doc.name,
            slug: doc.slug,
        }))
    } catch (error) {
        console.error("Error searching cities:", error)
        return []
    }
}
