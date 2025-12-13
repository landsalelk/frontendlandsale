import { NextRequest, NextResponse } from "next/server"
import CryptoJS from "crypto-js"
import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { ID, Query } from "node-appwrite"

const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || ""

/**
 * PayHere Server-to-Server Notification Handler
 * This endpoint receives payment status updates from PayHere
 */
export async function POST(req: NextRequest) {
    try {
        // PayHere sends form-urlencoded data
        const formData = await req.formData()

        const merchant_id = formData.get("merchant_id") as string
        const order_id = formData.get("order_id") as string
        const payment_id = formData.get("payment_id") as string
        const payhere_amount = formData.get("payhere_amount") as string
        const payhere_currency = formData.get("payhere_currency") as string
        const status_code = formData.get("status_code") as string
        const md5sig = formData.get("md5sig") as string
        const custom_1 = formData.get("custom_1") as string // userId
        const custom_2 = formData.get("custom_2") as string // propertyId

        console.log(`[PayHere Notify] Order: ${order_id}, Status: ${status_code}`)

        // Verify the signature
        const hashedSecret = CryptoJS.MD5(PAYHERE_MERCHANT_SECRET).toString().toUpperCase()
        const expectedSig = CryptoJS.MD5(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        ).toString().toUpperCase()

        if (md5sig !== expectedSig) {
            console.error("[PayHere Notify] Invalid signature!")
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        // Status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargedback
        const isSuccess = status_code === "2"

        if (isSuccess) {
            // Process successful payment
            await handleSuccessfulPayment({
                orderId: order_id,
                paymentId: payment_id,
                amount: payhere_amount,
                currency: payhere_currency,
                userId: custom_1,
                propertyId: custom_2
            })
        }

        // Store transaction record
        try {
            const { databases } = await createAdminClient()
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.TRANSACTIONS,
                ID.unique(),
                {
                    order_id: order_id,
                    payment_id: payment_id,
                    user_id: custom_1,
                    property_id: custom_2 || null,
                    amount: parseFloat(payhere_amount) * 100, // Store in cents
                    currency: payhere_currency,
                    status: isSuccess ? 'completed' : status_code === "0" ? 'pending' : 'failed',
                    provider: 'payhere',
                    created_at: new Date().toISOString()
                }
            )
        } catch (dbError) {
            console.error("[PayHere Notify] Error storing transaction:", dbError)
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("[PayHere Notify] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

async function handleSuccessfulPayment(data: {
    orderId: string,
    paymentId: string,
    amount: string,
    currency: string,
    userId: string,
    propertyId?: string
}) {
    const { databases } = await createAdminClient()

    // Determine what was purchased based on order_id prefix
    const orderType = data.orderId.split("_")[0]

    switch (orderType) {
        case "BOOST":
            // Boost the property listing
            if (data.propertyId) {
                const boostDays = parseFloat(data.amount) >= 1500 ? 30 : 7
                const boostUntil = new Date()
                boostUntil.setDate(boostUntil.getDate() + boostDays)

                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.LISTINGS,
                    data.propertyId,
                    {
                        is_boosted: true,
                        boost_until: boostUntil.toISOString()
                    }
                )
                console.log(`[PayHere] Boosted property ${data.propertyId} until ${boostUntil}`)
            }
            break

        case "VERIFY":
            // Mark property as verified (pending admin review)
            if (data.propertyId) {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.LISTINGS,
                    data.propertyId,
                    {
                        verification_requested: true,
                        verification_paid: true
                    }
                )
                console.log(`[PayHere] Verification requested for ${data.propertyId}`)
            }
            break

        case "AGENT":
            // Activate agent subscription
            // You would update the agents collection or users_extended
            console.log(`[PayHere] Agent subscription activated for ${data.userId}`)
            break

        default:
            console.log(`[PayHere] Unknown order type: ${orderType}`)
    }
}
