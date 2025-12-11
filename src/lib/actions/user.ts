'use server'

import { getCurrentUser, createSessionClient } from "@/lib/appwrite/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type ProfileActionState = {
    error?: string
    success?: boolean
    message?: string
}

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
})

const passwordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

/**
 * Get current user profile data
 */
export async function getUserProfile() {
    const user = await getCurrentUser()

    if (!user) return null

    return {
        id: user.$id,
        email: user.email || '',
        fullName: user.name || '',
        phone: (user as any).phone || '', // Type assertion for phone property
        avatarUrl: (user as any).prefs?.avatar_url || '', // Type assertion for prefs
    }
}

/**
 * Update user profile (name, phone)
 */
export async function updateProfile(formData: { fullName: string; phone?: string }): Promise<ProfileActionState> {
    const user = await getCurrentUser()

    if (!user) {
        return { error: "You must be logged in to update your profile" }
    }

    // Validate data
    const validatedFields = profileSchema.safeParse(formData)
    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0]?.message || "Invalid input" }
    }

    try {
        const { account } = await createSessionClient()

        // Update name
        await account.updateName(formData.fullName)

        // Update phone if provided
        if (formData.phone) {
            try {
                await account.updatePhone(formData.phone, '') // Empty password for phone-only update
            } catch {
                // Phone update may fail if not verified - ignore
            }
        }

        // Update preferences for additional data
        await account.updatePrefs({
            ...(user as any).prefs || {},
            phone: formData.phone || '',
        })

        revalidatePath('/dashboard/settings')
        return { success: true, message: "Profile updated successfully!" }
    } catch (error: any) {
        console.error("Error updating profile:", error)
        return { error: error?.message || "Failed to update profile. Please try again." }
    }
}

/**
 * Update user password
 */
export async function updatePassword(formData: { newPassword: string; currentPassword?: string }): Promise<ProfileActionState> {
    const user = await getCurrentUser()

    if (!user) {
        return { error: "You must be logged in to change your password" }
    }

    // Validate data
    const validatedFields = passwordSchema.safeParse(formData)
    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0]?.message || "Invalid input" }
    }

    try {
        const { account } = await createSessionClient()

        // Appwrite requires old password to update
        // If not provided, we can't update the password
        if (!formData.currentPassword) {
            return { error: "Current password is required to change your password" }
        }

        await account.updatePassword(formData.newPassword, formData.currentPassword)

        revalidatePath('/dashboard/settings')
        return { success: true, message: "Password updated successfully!" }
    } catch (error: any) {
        console.error("Error updating password:", error)
        return { error: error?.message || "Failed to update password. Please try again." }
    }
}
