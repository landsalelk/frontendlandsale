"use server"

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        const { account } = await createSessionClient()
        await account.deleteSession('current')
    } catch (error) {
        // Session might already be invalid
        console.error("Sign out error:", error)
    }

    // Clear the session cookie
    const cookieStore = await cookies()
    cookieStore.delete('appwrite-session')

    redirect('/login')
}

/**
 * Clear invalid session cookie
 */
export async function clearInvalidSession() {
    const cookieStore = await cookies()
    cookieStore.delete('appwrite-session')
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
    try {
        const { account } = await createSessionClient()
        return await account.get()
    } catch {
        return null
    }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string) {
    try {
        const { account } = await createSessionClient()
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

        await account.createRecovery(
            email,
            `${siteUrl}/reset-password`
        )

        return { success: true }
    } catch (error: any) {
        console.error("Password reset error:", error)
        return { error: error?.message || "Failed to send reset email" }
    }
}

/**
 * Complete password reset with token
 */
export async function completePasswordReset(userId: string, secret: string, newPassword: string) {
    try {
        const { account } = await createSessionClient()

        await account.updateRecovery(
            userId,
            secret,
            newPassword
        )

        return { success: true }
    } catch (error: any) {
        console.error("Password reset completion error:", error)
        return { error: error?.message || "Failed to reset password" }
    }
}

/**
 * Generate reset link (development only)
 */
export async function generateResetLink(email: string) {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
        return { error: "This feature is available in development mode only." }
    }

    try {
        // Appwrite doesn't have admin-generated links like Supabase
        // Return a message to use the password reset flow
        return {
            error: "Use the 'Forgot Password' flow instead. Appwrite handles password resets via email."
        }
    } catch (error) {
        console.error("Unexpected error:", error)
        return { error: "Failed to generate link" }
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(name: string) {
    try {
        const { account } = await createSessionClient()
        await account.updateName(name)
        return { success: true }
    } catch (error: any) {
        console.error("Profile update error:", error)
        return { error: error?.message || "Failed to update profile" }
    }
}

/**
 * Update user email
 */
export async function updateUserEmail(email: string, password: string) {
    try {
        const { account } = await createSessionClient()
        await account.updateEmail(email, password)
        return { success: true }
    } catch (error: any) {
        console.error("Email update error:", error)
        return { error: error?.message || "Failed to update email" }
    }
}

/**
 * Update user password
 */
export async function updateUserPassword(newPassword: string, oldPassword: string) {
    try {
        const { account } = await createSessionClient()
        await account.updatePassword(newPassword, oldPassword)
        return { success: true }
    } catch (error: any) {
        console.error("Password update error:", error)
        return { error: error?.message || "Failed to update password" }
    }
}
