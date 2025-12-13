"use server"

import { createAdminClient } from "@/lib/appwrite/server"
import { ID } from "node-appwrite"

/**
 * Sends an email using Appwrite Messaging
 * @param subject Email subject
 * @param content Email body (HTML)
 * @param to Array of user IDs or email addresses
 */
export async function sendEmail({
    subject,
    content,
    to,
    isHtml = true
}: {
    subject: string,
    content: string,
    to: string[],
    isHtml?: boolean
}) {
    try {
        const { messaging } = await createAdminClient()

        // Create a new message
        // Note: You need to set up an Email Provider (Mailgun, Sendgrid, etc.) in Appwrite Console first.
        const message = await messaging.createEmail(
            ID.unique(), // Message ID
            subject,    // Subject
            content,    // Content
            [],         // Topics (optional)
            to,         // Targets (User IDs)
        )

        return { success: true, messageId: message.$id }
    } catch (error: any) {
        console.error("Failed to send email:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Sends an SMS using Appwrite Messaging
 * @param content SMS content
 * @param to Array of user IDs or phone numbers
 */
export async function sendSMS({
    content,
    to
}: {
    content: string,
    to: string[]
}) {
    try {
        const { messaging } = await createAdminClient()

        // Note: You need to set up an SMS Provider (Twilio, Msg91, etc.) in Appwrite Console first.
        const message = await messaging.createSms(
            ID.unique(),
            content,
            [], // Topics
            to  // Targets
        )

        return { success: true, messageId: message.$id }
    } catch (error: any) {
        console.error("Failed to send SMS:", error)
        return { success: false, error: error.message }
    }
}
