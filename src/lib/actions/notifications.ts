"use server"

import { sendSMS, sendEmail } from "@/lib/actions/messaging"
import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"

/**
 * Notifies the seller that a potential buyer is interested.
 * Triggered when a buyer clicks "Call", "WhatsApp", or "Chat".
 */
export async function notifySellerOfInterest({
    sellerId,
    propertyTitle,
    propertyId,
    actionType // 'call' | 'whatsapp' | 'favorite'
}: {
    sellerId: string,
    propertyTitle: string,
    propertyId: string,
    actionType: 'call' | 'whatsapp' | 'favorite'
}) {
    if (!sellerId) return { success: false, error: "No seller ID" }

    try {
        // Fetch seller details to check preferences (optional optimization)
        // For now, we assume we notify via SMS if phone is available, else Email.
        // In a real app, you'd check `user.prefs.notifications_enabled`

        const { users } = await createAdminClient()
        const seller = await users.get(sellerId)

        let message = ""
        let subject = ""

        switch (actionType) {
            case 'call':
                message = `LandSale Alert: A buyer just clicked to CALL you about "${propertyTitle}". Be ready!`
                break;
            case 'whatsapp':
                message = `LandSale Alert: A buyer is contacting you via WhatsApp about "${propertyTitle}".`
                break;
            case 'favorite':
                message = `Good News! Someone just added your property "${propertyTitle}" to their favorites.`
                break;
        }

        // Try SMS first (High urgency)
        if (seller.phone && ['call', 'whatsapp'].includes(actionType)) {
            const res = await sendSMS({ content: message, to: [sellerId] })
            if (res.success) return { success: true, method: 'sms' }
        }

        // Fallback to Email (or for Favorites which are lower urgency)
        if (seller.email) {
            subject = `New Interest in ${propertyTitle}`
            const htmlContent = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #059669;">${actionType === 'favorite' ? 'New Fan!' : 'Hot Lead!'}</h2>
                    <p>${message}</p>
                    <p>View your listing analytics <a href="https://landsale.lk/dashboard/my-ads">here</a>.</p>
                </div>
            `
            const res = await sendEmail({ subject, content: htmlContent, to: [sellerId] })
            return res
        }

        return { success: false, error: "No contact method available" }

    } catch (error: any) {
        console.error("Error notifying seller:", error)
        return { success: false, error: error.message }
    }
}
