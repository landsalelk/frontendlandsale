'use server'

import { getCurrentUser, createSessionClient } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS, BUCKETS } from "@/lib/appwrite/config"
import { propertyFormSchema, PropertyFormValues } from "@/lib/schemas"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ID, Query } from "node-appwrite"

export type ActionState = {
    error?: string
    success?: boolean
}

export async function deleteProperty(propertyId: string): Promise<ActionState> {
    const user = await getCurrentUser()
    if (!user) return { error: "Unauthorized" }

    try {
        const { databases, storage } = await createSessionClient()

        // First verify the property belongs to the user
        const property = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, propertyId)

        if (property.user_id !== user.$id) {
            return { error: "You don't have permission to delete this property" }
        }

        // Clean up associated images from storage
        if (property.images && Array.isArray(property.images)) {
            for (const imageUrl of property.images) {
                try {
                    // Extract file ID from Appwrite URL
                    const fileIdMatch = imageUrl.match(/files\/([a-zA-Z0-9]+)\//)
                    if (fileIdMatch && fileIdMatch[1]) {
                        await storage.deleteFile(BUCKETS.LISTING_IMAGES, fileIdMatch[1])
                        console.log(`Deleted image file: ${fileIdMatch[1]}`)
                    }
                } catch (imageError) {
                    console.warn(`Failed to delete image: ${imageUrl}`, imageError)
                    // Continue with deletion even if image cleanup fails
                }
            }
        }

        // Delete the property document
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LISTINGS, propertyId)

        revalidatePath('/dashboard/my-ads')
        return { success: true }
    } catch (error: any) {
        console.error("Delete error:", error)
        return { error: "Failed to delete property" }
    }
}

export async function createProperty(data: PropertyFormValues): Promise<ActionState> {
    const user = await getCurrentUser()
    if (!user) {
        return { error: "Please log in to post your property listing." }
    }

    // Validate Data
    const validatedFields = propertyFormSchema.safeParse(data)
    if (!validatedFields.success) {
        const fieldErrors = (validatedFields as any).error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
        return { error: `Please check your form: ${fieldErrors}` }
    }

    try {
        const { databases } = await createSessionClient()

        // Get user's IP address for security
        const headers = new Headers()
        const forwarded = headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

        // Create slug from title
        const slug = data.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 200)

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            ID.unique(),
            {
                user_id: user.$id,
                category_id: 'default_category', // Will be updated when categories are implemented
                title: JSON.stringify({ en: data.title }), // i18n support
                description: JSON.stringify({ en: data.description }), // i18n support
                slug: slug,
                listing_type: 'sale', // Default to sale for now
                status: 'pending',
                price: Math.round(data.price * 100), // Convert to cents
                currency_code: 'LKR',
                price_negotiable: data.priceNegotiable || false,
                location: JSON.stringify({
                    country: 'LK',
                    country_name: 'Sri Lanka',
                    region: data.district,
                    city: data.city,
                    area: data.district, // Using district as area for now
                    address: data.address || '',
                    lat: 0, // Will be updated with geocoding
                    lng: 0, // Will be updated with geocoding
                }),
                contact: JSON.stringify({
                    name: data.contactName,
                    email: user.email,
                    phone: data.contactPhone,
                    whatsapp: data.whatsapp || data.contactPhone,
                    show_email: true,
                    show_phone: true,
                }),
                attributes: JSON.stringify({
                    bedrooms: data.bedrooms || 0,
                    bathrooms: data.bathrooms || 0,
                    size: data.size,
                }),
                features: data.features || [],
                images: data.images || [],
                is_premium: false,
                views_count: 0,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                ip_address: ip,
                auction_enabled: false,
                bid_count: 0,
            }
        )

        revalidatePath('/dashboard/my-ads')
        redirect('/dashboard/my-ads')
    } catch (error: any) {
        console.error("Database Error:", error)
        return { error: "We couldn't save your listing due to a technical issue. Please try again or contact support if the problem persists." }
    }
}

export async function getPropertyForEdit(propertyId: string) {
    const user = await getCurrentUser()
    if (!user) return null

    try {
        const { databases } = await createSessionClient()
        const property = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, propertyId)

        if (property.user_id !== user.$id) {
            return null
        }

        // Transform new schema back to old format for compatibility
        const title = property.title ? JSON.parse(property.title).en : ''
        const description = property.description ? JSON.parse(property.description).en : ''
        const location = property.location ? JSON.parse(property.location) : {}
        const contact = property.contact ? JSON.parse(property.contact) : {}
        const attributes = property.attributes ? JSON.parse(property.attributes) : {}

        return {
            ...property,
            title,
            description,
            type: property.listing_type === 'sale' ? 'land' : property.listing_type,
            district: location.region || '',
            city: location.city || '',
            address: location.address || '',
            price: property.price ? property.price / 100 : 0, // Convert from cents
            size: attributes.size || '',
            bedrooms: attributes.bedrooms || 0,
            bathrooms: attributes.bathrooms || 0,
            contactName: contact.name || '',
            contactPhone: contact.phone || '',
            whatsapp: contact.whatsapp || '',
            features: property.features || [],
            images: property.images || [],
            priceNegotiable: property.price_negotiable || false,
            status: property.status || 'active',
            user_id: property.user_id,
        }
    } catch (error) {
        console.error("Error fetching property for edit:", error)
        return null
    }
}

export async function updateProperty(propertyId: string, data: PropertyFormValues): Promise<ActionState> {
    const user = await getCurrentUser()
    if (!user) {
        return { error: "Please log in to edit your property listing." }
    }

    // Validate Data
    const validatedFields = propertyFormSchema.safeParse(data)
    if (!validatedFields.success) {
        const fieldErrors = (validatedFields as any).error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
        return { error: `Please check your form: ${fieldErrors}` }
    }

    try {
        const { databases } = await createSessionClient()

        // Verify ownership
        const property = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, propertyId)
        if (property.user_id !== user.$id) {
            return { error: "You don't have permission to edit this property." }
        }

        // Create slug from title
        const slug = data.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 200)

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            propertyId,
            {
                title: JSON.stringify({ en: data.title }),
                description: JSON.stringify({ en: data.description }),
                slug: slug,
                price: Math.round(data.price * 100), // Convert to cents
                price_negotiable: data.priceNegotiable || false,
                location: JSON.stringify({
                    country: 'LK',
                    country_name: 'Sri Lanka',
                    region: data.district,
                    city: data.city,
                    area: data.district,
                    address: data.address || '',
                    lat: 0,
                    lng: 0,
                }),
                contact: JSON.stringify({
                    name: data.contactName,
                    email: user.email,
                    phone: data.contactPhone,
                    whatsapp: data.whatsapp || data.contactPhone,
                    show_email: true,
                    show_phone: true,
                }),
                attributes: JSON.stringify({
                    bedrooms: data.bedrooms || 0,
                    bathrooms: data.bathrooms || 0,
                    size: data.size,
                }),
                features: data.features || [],
                images: data.images || [],
            }
        )

        revalidatePath('/dashboard/my-ads')
        redirect('/dashboard/my-ads')
    } catch (error: any) {
        console.error("Database Error:", error)
        return { error: "We couldn't update your listing due to a technical issue. Please try again or contact support if the problem persists." }
    }
}

export async function getSimilarProperties(propertyId: string, type: string, district: string) {
    try {
        const { databases } = await createSessionClient()

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('listing_type', type === 'land' ? 'sale' : type), // Map old type to new listing_type
                Query.notEqual('$id', propertyId),
                Query.equal('status', 'active'),
                Query.limit(3)
            ]
        )

        // Transform new schema back to old format for compatibility
        return response.documents.map(property => {
            const title = property.title ? JSON.parse(property.title).en : ''
            const location = property.location ? JSON.parse(property.location) : {}
            const attributes = property.attributes ? JSON.parse(property.attributes) : {}

            return {
                ...property,
                title,
                type: property.listing_type === 'sale' ? 'land' : property.listing_type, // Map back to old type
                district: location.region || '',
                city: location.city || '',
                price: property.price ? property.price / 100 : 0, // Convert from cents
                size: attributes.size || '',
                bedrooms: attributes.bedrooms || 0,
                bathrooms: attributes.bathrooms || 0,
            }
        })
    } catch (error) {
        console.error("Error fetching similar properties:", error)
        return []
    }
}

export async function incrementPropertyViews(propertyId: string) {
    try {
        const { databases } = await createSessionClient()

        const property = await databases.getDocument(DATABASE_ID, COLLECTIONS.LISTINGS, propertyId)
        const currentViews = property.views_count || 0

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            propertyId,
            { views_count: currentViews + 1 }
        )
    } catch (error) {
        // Silent fail for view tracking
        console.error("Error incrementing views:", error)
    }
}
