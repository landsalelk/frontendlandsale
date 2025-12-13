import { NextRequest, NextResponse } from "next/server"
import CryptoJS from "crypto-js"

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || ""
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || ""
const PAYHERE_MODE = process.env.PAYHERE_MODE || "sandbox" // 'sandbox' or 'live'

const PAYHERE_URL = PAYHERE_MODE === "live"
    ? "https://www.payhere.lk/pay/checkout"
    : "https://sandbox.payhere.lk/pay/checkout"

// Product configurations
const PRODUCTS = {
    boost_weekly: {
        name: "Boost Listing - 1 Week",
        price: 500.00,
        currency: "LKR",
        description: "Get your listing at the top of search results for 7 days"
    },
    boost_monthly: {
        name: "Boost Listing - 1 Month",
        price: 1500.00,
        currency: "LKR",
        description: "Get your listing at the top of search results for 30 days"
    },
    verified_badge: {
        name: "Verified Badge",
        price: 1500.00,
        currency: "LKR",
        description: "Get your property verified and display a trust badge"
    },
    agent_monthly: {
        name: "Agent Pro Subscription",
        price: 2500.00,
        currency: "LKR",
        description: "Unlimited leads in your service areas for 30 days"
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { productId, orderId, userId, userEmail, userName, userPhone, propertyId } = body

        if (!productId || !PRODUCTS[productId as keyof typeof PRODUCTS]) {
            return NextResponse.json({ error: "Invalid product" }, { status: 400 })
        }

        const product = PRODUCTS[productId as keyof typeof PRODUCTS]
        const amount = product.price.toFixed(2)

        // Generate MD5 hash for PayHere security
        // hash = md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
        const hashedSecret = CryptoJS.MD5(PAYHERE_MERCHANT_SECRET).toString().toUpperCase()
        const hash = CryptoJS.MD5(
            PAYHERE_MERCHANT_ID + orderId + amount + product.currency + hashedSecret
        ).toString().toUpperCase()

        // Build PayHere payment data
        const paymentData = {
            sandbox: PAYHERE_MODE === "sandbox",
            merchant_id: PAYHERE_MERCHANT_ID,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/cancel`,
            notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/notify`,
            order_id: orderId,
            items: product.name,
            currency: product.currency,
            amount: amount,
            first_name: userName?.split(" ")[0] || "Customer",
            last_name: userName?.split(" ").slice(1).join(" ") || "",
            email: userEmail || "customer@example.com",
            phone: userPhone || "0771234567",
            address: "Landsale.lk",
            city: "Colombo",
            country: "Sri Lanka",
            hash: hash,
            // Custom fields for our use
            custom_1: userId,
            custom_2: propertyId || "",
        }

        return NextResponse.json({
            success: true,
            checkoutUrl: PAYHERE_URL,
            paymentData,
            product
        })

    } catch (error: any) {
        console.error("[PayHere] Error generating payment:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
