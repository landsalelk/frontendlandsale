"use server"

import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { ID, Query } from "node-appwrite"

// Digital Product Types
export type DigitalProductType = 'investment_report' | 'blueprint' | 'raw_images' | 'valuation_report'

interface DigitalProduct {
    id: string
    property_id: string
    type: DigitalProductType
    name: string
    description: string
    price: number // In LKR
    file_id?: string // Link to premium-assets bucket
    preview_file_id?: string // Link to public-showcase bucket (watermarked)
    is_generated: boolean
    created_at: string
}

// Product catalog with prices
export const DIGITAL_PRODUCTS_CATALOG: Record<DigitalProductType, {
    name: string
    description: string
    price: number
    icon: string
}> = {
    investment_report: {
        name: "Investment Analysis Report",
        description: "AI-powered ROI analysis, future value prediction, and market trends for this property",
        price: 500,
        icon: "📊"
    },
    valuation_report: {
        name: "Professional Valuation Report",
        description: "Detailed valuation based on comparable sales, location analysis, and market data",
        price: 1500,
        icon: "📋"
    },
    blueprint: {
        name: "Land Survey & Blueprint",
        description: "Detailed land measurements, boundary markers, and survey data",
        price: 2500,
        icon: "📐"
    },
    raw_images: {
        name: "High-Resolution Images Pack",
        description: "Original, unwatermarked photos in full resolution (10+ images)",
        price: 300,
        icon: "📸"
    }
}

/**
 * Get available digital products for a property
 */
export async function getDigitalProductsForProperty(propertyId: string) {
    try {
        const { databases } = await createAdminClient()

        // Check if digital_products collection exists
        // For now, return mock products based on catalog
        const products = Object.entries(DIGITAL_PRODUCTS_CATALOG).map(([type, product]) => ({
            id: `${propertyId}_${type}`,
            property_id: propertyId,
            type: type as DigitalProductType,
            name: product.name,
            description: product.description,
            price: product.price,
            icon: product.icon,
            is_available: true
        }))

        return { success: true, products }
    } catch (error: any) {
        console.error("[DigitalProducts] Error:", error)
        return { success: false, products: [], error: error.message }
    }
}

/**
 * Create a purchase record and trigger generation
 */
export async function purchaseDigitalProduct({
    propertyId,
    productType,
    userId,
    paymentId
}: {
    propertyId: string
    productType: DigitalProductType
    userId: string
    paymentId: string
}) {
    try {
        const { databases } = await createAdminClient()

        // 1. Create purchase record
        const purchase = await databases.createDocument(
            DATABASE_ID,
            'digital_purchases', // You may need to create this collection
            ID.unique(),
            {
                user_id: userId,
                property_id: propertyId,
                product_type: productType,
                payment_id: paymentId,
                status: 'processing',
                created_at: new Date().toISOString()
            }
        )

        // 2. Trigger Appwrite Function to generate the product
        // This would call: /api/generate-product or an Appwrite Function
        // For now, we'll mark as ready immediately (mock)

        console.log(`[DigitalProducts] Purchase created: ${purchase.$id}`)

        return {
            success: true,
            purchaseId: purchase.$id,
            message: "Processing your order. You'll receive the download link shortly."
        }
    } catch (error: any) {
        console.error("[DigitalProducts] Purchase error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Get download link for a purchased product
 * Only works if user has purchased the product
 */
export async function getProductDownloadLink({
    purchaseId,
    userId
}: {
    purchaseId: string
    userId: string
}) {
    try {
        const { databases, storage } = await createAdminClient()

        // 1. Verify the purchase belongs to this user
        const purchase = await databases.getDocument(
            DATABASE_ID,
            'digital_purchases',
            purchaseId
        )

        if (purchase.user_id !== userId) {
            return { success: false, error: "Unauthorized" }
        }

        if (purchase.status !== 'completed') {
            return { success: false, error: "Product is still being generated" }
        }

        // 2. Generate temporary download URL (valid for 1 hour)
        // In production, you'd use storage.getFileDownload with proper bucket
        const downloadUrl = `/api/downloads/${purchaseId}?token=${Date.now()}`

        return { success: true, downloadUrl }
    } catch (error: any) {
        console.error("[DigitalProducts] Download error:", error)
        return { success: false, error: error.message }
    }
}
