"use server"

import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { sendSMS, sendEmail } from "@/lib/actions/messaging"
import { Query, ID } from "node-appwrite"

interface LeadDispatchData {
    propertyId: string
    propertyTitle: string
    city: string
    district: string
    price: number
    sellerPhone?: string
}

/**
 * Dispatches a new property lead to all agents serving that area.
 * Called when a new listing is created.
 */
export async function dispatchLeadToAgents(data: LeadDispatchData) {
    try {
        const { databases } = await createAdminClient()

        // 1. Find all agents that serve this area
        // Note: This assumes we have an 'agents' collection with a 'service_areas' field (array)
        // For now, we'll log the action since the collection may not exist yet

        console.log(`[Lead Dispatch] New listing in ${data.city}, ${data.district}`)
        console.log(`[Lead Dispatch] Would notify agents covering: ${data.district}`)

        // In production, you would:
        // const agents = await databases.listDocuments(
        //     DATABASE_ID,
        //     COLLECTIONS.AGENTS,
        //     [Query.contains('service_areas', data.district)]
        // )

        // For each agent, send a notification
        // for (const agent of agents.documents) {
        //     await sendSMS({
        //         content: `New Lead! ${data.propertyTitle} in ${data.city} - Rs. ${data.price}. Contact: ${data.sellerPhone}`,
        //         to: [agent.user_id]
        //     })
        // }

        return { success: true, dispatchedCount: 0 } // Placeholder

    } catch (error: any) {
        console.error("[Lead Dispatch] Error:", error)
        return { success: false, error: error.message }
    }
}

interface AgentProfileData {
    userId: string
    fullName: string
    phone: string
    whatsapp?: string
    bio: string
    experience: number
    serviceAreas: string[]
    specializations: string[]
}

/**
 * Creates a new agent profile (pending verification).
 */
export async function createAgentProfile(data: AgentProfileData) {
    try {
        const { databases } = await createAdminClient()

        // Check if user already has an agent profile
        // For now, we'll just create a document in users_extended or a new agents collection

        // Placeholder: In production, create in 'agents' collection
        console.log("[Agent] Creating profile for:", data.fullName)
        console.log("[Agent] Service Areas:", data.serviceAreas.join(", "))

        // await databases.createDocument(
        //     DATABASE_ID,
        //     'agents', // You may need to create this collection
        //     ID.unique(),
        //     {
        //         user_id: data.userId,
        //         name: data.fullName,
        //         phone: data.phone,
        //         whatsapp: data.whatsapp,
        //         bio: data.bio,
        //         experience_years: data.experience,
        //         service_areas: data.serviceAreas,
        //         specializations: data.specializations,
        //         is_verified: false,
        //         status: 'pending',
        //         rating: 0,
        //         review_count: 0,
        //         deals_count: 0
        //     }
        // )

        return { success: true }
    } catch (error: any) {
        console.error("[Agent] Error creating profile:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Gets agents that cover a specific area (for property pages).
 */
export async function getAgentsForArea(district: string) {
    try {
        // Placeholder: Return mock data for now
        // In production, query the agents collection

        return {
            success: true,
            agents: [] // Would return actual agents
        }
    } catch (error: any) {
        return { success: false, error: error.message, agents: [] }
    }
}
