"use server"

import { createSessionClient, createAdminClient } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS, BUCKETS } from "@/lib/appwrite/config"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ID, Query } from "node-appwrite"

export type ActionState = {
    error?: string
    success?: boolean
}

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
        try {
            const user = await account.get()
            return user
        } catch (accountError: any) {
            if (accountError.message?.includes('missing scopes') && 
                accountError.message?.includes('account')) {
                console.warn("Session valid but API key lacks account scope.")
                return { $id: 'session-user', email: 'user@session.valid', name: 'Session User' }
            }
            throw accountError
        }
    } catch (error: any) {
        console.error("Session validation failed:", error.message)
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

/**
 * Delete user account with complete data cleanup
 * WARNING: This is irreversible and deletes all user data
 */
export async function deleteUserAccount(password: string): Promise<ActionState> {
    try {
        const { databases, storage, account } = await createSessionClient()
        const user = await account.get()
        
        // Verify password first by trying to update it (will fail if wrong)
        try {
            await account.updatePassword(password, password)
        } catch (error: any) {
            return { error: "Invalid password. Cannot delete account." }
        }

        // Create admin client for user deletion (requires API key)
        const { users: adminUsers } = await createAdminClient()

        // Step 1: Delete all user listings and their images
        const userListings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [Query.equal('user_id', user.$id)]
        )

        for (const listing of userListings.documents) {
            // Delete listing images from storage
            if (listing.images && Array.isArray(listing.images)) {
                for (const imageUrl of listing.images) {
                    try {
                        const fileIdMatch = imageUrl.match(/files\/([a-zA-Z0-9]+)\//)
                        if (fileIdMatch && fileIdMatch[1]) {
                            await storage.deleteFile(BUCKETS.LISTING_IMAGES, fileIdMatch[1])
                            console.log(`Deleted listing image: ${fileIdMatch[1]}`)
                        }
                    } catch (imageError) {
                        console.warn(`Failed to delete listing image: ${imageUrl}`, imageError)
                    }
                }
            }
            
            // Delete the listing document
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LISTINGS, listing.$id)
        }

        // Step 2: Delete user favorites
        const userFavorites = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            [Query.equal('user_id', user.$id)]
        )

        for (const favorite of userFavorites.documents) {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FAVORITES, favorite.$id)
        }

        // Step 3: Delete user avatar from storage
        try {
            const userExtended = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS_EXTENDED,
                [Query.equal('user_id', user.$id)]
            )
            
            if (userExtended.documents.length > 0 && userExtended.documents[0].avatar_url) {
                const avatarUrl = userExtended.documents[0].avatar_url
                const fileIdMatch = avatarUrl.match(/files\/([a-zA-Z0-9]+)\//)
                if (fileIdMatch && fileIdMatch[1]) {
                    await storage.deleteFile(BUCKETS.USER_AVATARS, fileIdMatch[1])
                    console.log(`Deleted user avatar: ${fileIdMatch[1]}`)
                }
            }
            
            // Delete user extended document
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.USERS_EXTENDED, userExtended.documents[0].$id)
        } catch (userExtendedError) {
            console.warn("Failed to cleanup user extended data:", userExtendedError)
        }

        // Step 4: Delete user account using admin client (this will also delete all sessions)
        await adminUsers.delete(user.$id)

        // Clear session cookie
        const cookieStore = await cookies()
        cookieStore.delete('appwrite-session')

        return { success: true }
    } catch (error: any) {
        console.error("Account deletion error:", error)
        return { error: error?.message || "Failed to delete account" }
    }
}
