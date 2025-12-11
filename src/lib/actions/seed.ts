"use server"

import { createSessionClient } from "@/lib/appwrite/server"
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config"
import { ID } from "node-appwrite"

const SEED_DATA = [
    {
        type: "land",
        title: "Prime Beachfront Land in Galle",
        description: "Exclusive 15 perch land block situated right on the golden sandy beaches of Galle. Perfect for a boutique hotel or a luxury holiday villa. Clear deeds, electricity, and water available.",
        price: 45000000,
        district: "Galle",
        city: "Unawatuna",
        size: "15 Perches",
        images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e", "https://images.unsplash.com/photo-1520483602335-3a2adb1be29d"],
        status: "active",
        views: 0,
        bedrooms: 0,
        bathrooms: 0,
    },
    {
        type: "house",
        title: "Modern 3-Story Luxury House in Colombo 7",
        description: "Architecturally designed 3-story house in the heart of Colombo 7. 5 Bedrooms with en-suite bathrooms, rooftop garden, swimming pool, and solar power. Walking distance to international schools.",
        price: 250000000,
        district: "Colombo",
        city: "Cinnamon Gardens",
        size: "3500 Sqft",
        bedrooms: 5,
        bathrooms: 5,
        images: ["https://images.unsplash.com/photo-1600596542815-2a4304aa5d25", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"],
        status: "active",
        views: 0,
    },
    {
        type: "land",
        title: "10 Acres Coconut Estate in Kurunegala",
        description: "Highly productive coconut estate with over 600 bearing trees. Intercropped with pepper and banana. Bungalow available with electricity and well water. Ideal for investment.",
        price: 85000000,
        district: "Kurunegala",
        city: "Mawathagama",
        size: "10 Acres",
        images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1"],
        status: "active",
        views: 0,
        bedrooms: 0,
        bathrooms: 0,
    },
    {
        type: "house",
        title: "Cozy Holiday Cottage in Nuwara Eliya",
        description: "Charming 3 bedroom cottage sold fully furnished. Scenic view of Lake Gregory. Fireplace, wooden floors, and beautifully landscaped garden.",
        price: 65000000,
        district: "Nuwara Eliya",
        city: "Nuwara Eliya Town",
        size: "1500 Sqft",
        bedrooms: 3,
        bathrooms: 2,
        images: ["https://images.unsplash.com/photo-1542718610-a1d656d1884c", "https://images.unsplash.com/photo-1449844908441-8829872d2607"],
        status: "active",
        views: 0,
    },
    {
        type: "commercial",
        title: "Warehouse/Factory Space in Kelaniya",
        description: "Large open floor warehouse space suitable for logistics or manufacturing. 40ft container access. Three phase electricity and office space partitions included.",
        price: 150000,
        district: "Gampaha",
        city: "Kelaniya",
        size: "5000 Sqft",
        images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"],
        status: "active",
        views: 0,
        bedrooms: 0,
        bathrooms: 0,
    },
    {
        type: "land",
        title: "Cheap Residential Plot in Homagama",
        description: "10 Perch bare land in a rapidly developing area. Close to NSBM Green University and Highway Entrance. Good neighborhood.",
        price: 850000,
        district: "Colombo",
        city: "Homagama",
        size: "10 Perches",
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef"],
        status: "active",
        views: 0,
        bedrooms: 0,
        bathrooms: 0,
    }
]

export async function seedProperties() {
    try {
        const { account, databases } = await createSessionClient()

        // Verify user is logged in
        const user = await account.get()
        if (!user) {
            return { error: "You must be logged in to seed data." }
        }

        // Insert data
        let successCount = 0
        for (const item of SEED_DATA) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.LISTINGS,
                    ID.unique(),
                    {
                        ...item,
                        user_id: user.$id
                    }
                )
                successCount++
            } catch (err) {
                console.error("Error seeding property:", err)
            }
        }

        return { success: true, count: successCount }
    } catch (error: any) {
        console.error("Seed Error:", error)
        return { error: error?.message || "Failed to seed data" }
    }
}
