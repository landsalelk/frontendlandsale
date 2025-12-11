'use server'

import { getCurrentUser, createSessionClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { Query, ID } from "node-appwrite"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { transformListingToProperty } from "@/lib/utils"

export type InquiryActionState = {
    error?: string
    success?: boolean
    message?: string
}

const inquirySchema = z.object({
    propertyId: z.string().min(1),
    sellerId: z.string().min(1),
    senderName: z.string().min(2, "Name must be at least 2 characters"),
    senderEmail: z.string().email("Please enter a valid email").optional().or(z.literal('')),
    senderPhone: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
})

// Define the inquiries collection ID - may need to be created
const INQUIRIES_COLLECTION = 'inquiries'

/**
 * Send an inquiry to a property seller
 * Note: This requires an 'inquiries' collection to be set up in Appwrite
 */
export async function sendInquiry(formData: {
    propertyId: string
    sellerId: string
    senderName: string
    senderEmail?: string
    senderPhone?: string
    message: string
}): Promise<InquiryActionState> {
    const user = await getCurrentUser()

    if (!user) {
        return { error: "You must be logged in to send an inquiry" }
    }

    // Don't allow users to inquire about their own property
    if (user.$id === formData.sellerId) {
        return { error: "You cannot send an inquiry for your own property" }
    }

    // Validate data
    const validatedFields = inquirySchema.safeParse(formData)
    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0]?.message || "Invalid input" }
    }

    try {
        const { databases } = await createSessionClient()

        // Insert inquiry
        await databases.createDocument(
            DATABASE_ID,
            INQUIRIES_COLLECTION,
            ID.unique(),
            {
                property_id: formData.propertyId,
                seller_id: formData.sellerId,
                sender_id: user.$id,
                sender_name: formData.senderName,
                sender_email: formData.senderEmail || null,
                sender_phone: formData.senderPhone || null,
                message: formData.message,
                is_read: false
            }
        )

        revalidatePath(`/properties/${formData.propertyId}`)
        return { success: true, message: "Your inquiry has been sent to the seller!" }
    } catch (error: any) {
        console.error("Error sending inquiry:", error)
        // If collection doesn't exist yet, provide helpful message
        if (error?.code === 404) {
            return { error: "Inquiry system is being set up. Please try again later." }
        }
        return { error: "Failed to send inquiry. Please try again." }
    }
}

/**
 * Get inquiries for the current user's properties (seller view)
 */
export async function getInquiries(): Promise<{ inquiries: any[], error: any }> {
    const user = await getCurrentUser()

    if (!user) return { inquiries: [], error: null }

    try {
        const { databases } = await createSessionClient()

        const response = await databases.listDocuments(
            DATABASE_ID,
            INQUIRIES_COLLECTION,
            [
                Query.equal('seller_id', user.$id),
                Query.orderDesc('$createdAt')
            ]
        )

        // For each inquiry, fetch the property details
        const inquiriesWithProperty = await Promise.all(
            response.documents.map(async (inquiry) => {
                try {
                    const listing = await databases.getDocument(
                        DATABASE_ID,
                        COLLECTIONS.LISTINGS,
                        inquiry.property_id
                    )
                    const property = transformListingToProperty(listing)
                    return {
                        id: inquiry.$id,
                        sender_name: inquiry.sender_name,
                        sender_email: inquiry.sender_email,
                        sender_phone: inquiry.sender_phone,
                        message: inquiry.message,
                        is_read: inquiry.is_read,
                        created_at: inquiry.$createdAt,
                        property: {
                            id: property.$id,
                            title: property.title,
                            images: property.images
                        }
                    }
                } catch {
                    return {
                        id: inquiry.$id,
                        sender_name: inquiry.sender_name,
                        sender_email: inquiry.sender_email,
                        sender_phone: inquiry.sender_phone,
                        message: inquiry.message,
                        is_read: inquiry.is_read,
                        created_at: inquiry.$createdAt,
                        property: null
                    }
                }
            })
        )

        return { inquiries: inquiriesWithProperty, error: null }
    } catch (error: any) {
        console.error("Error fetching inquiries:", error)
        // If collection doesn't exist, return empty
        if (error?.code === 404) {
            return { inquiries: [], error: null }
        }
        return { inquiries: [], error }
    }
}

/**
 * Get inquiries for the current user's properties (seller view) - legacy function name
 */
export async function getSellerInquiries() {
    const { inquiries } = await getInquiries()
    return inquiries
}

/**
 * Mark an inquiry as read
 */
export async function markInquiryAsRead(inquiryId: string): Promise<InquiryActionState> {
    const user = await getCurrentUser()

    if (!user) {
        return { error: "You must be logged in" }
    }

    try {
        const { databases } = await createSessionClient()

        await databases.updateDocument(
            DATABASE_ID,
            INQUIRIES_COLLECTION,
            inquiryId,
            { is_read: true }
        )

        revalidatePath('/dashboard/inquiries')
        return { success: true }
    } catch (error) {
        console.error("Error marking inquiry as read:", error)
        return { error: "Failed to update inquiry" }
    }
}

/**
 * Get unread inquiry count for the current user
 */
export async function getUnreadInquiryCount(): Promise<number> {
    const user = await getCurrentUser()

    if (!user) return 0

    try {
        const { databases } = await createSessionClient()

        const response = await databases.listDocuments(
            DATABASE_ID,
            INQUIRIES_COLLECTION,
            [
                Query.equal('seller_id', user.$id),
                Query.equal('is_read', false)
            ]
        )

        return response.total
    } catch (error) {
        console.error("Error fetching unread count:", error)
        return 0
    }
}
