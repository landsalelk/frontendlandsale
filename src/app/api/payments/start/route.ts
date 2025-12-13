import { NextRequest, NextResponse } from "next/server"
import CryptoJS from "crypto-js"

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || ""
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || ""
const PAYHERE_MODE = process.env.PAYHERE_MODE || "sandbox" // 'sandbox' or 'live'

const PAYHERE_URL = PAYHERE_MODE === "live"
    ? "https://www.payhere.lk/pay/checkout"
    : "https://sandbox.payhere.lk/pay/checkout"

// Product configurations
const PRODUCTS: Record<string, { name: string; price: number; currency: string; description: string }> = {
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
    },
    // Digital Products
    investment_report: {
        name: "Investment Analysis Report",
        price: 500.00,
        currency: "LKR",
        description: "AI-powered ROI analysis and future value prediction"
    },
    valuation_report: {
        name: "Professional Valuation Report",
        price: 1500.00,
        currency: "LKR",
        description: "Detailed valuation based on market data"
    },
    blueprint: {
        name: "Land Survey & Blueprint",
        price: 2500.00,
        currency: "LKR",
        description: "Detailed land measurements and survey data"
    },
    raw_images: {
        name: "High-Resolution Images Pack",
        price: 300.00,
        currency: "LKR",
        description: "Original, unwatermarked photos in full resolution"
    },
    // Flexible digital product (uses custom amount)
    digital_product: {
        name: "Digital Product",
        price: 0, // Will be overridden by customAmount
        currency: "LKR",
        description: "Premium digital content"
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { productId, orderId, userId, userEmail, userName, userPhone, propertyId, customAmount, customName } = body

        if (!productId || !PRODUCTS[productId]) {
            return NextResponse.json({ error: "Invalid product" }, { status: 400 })
        }

        let product = { ...PRODUCTS[productId] }

        // Allow custom amount/name for flexible products
        if (customAmount && customAmount > 0) {
            product.price = customAmount
        }
        if (customName) {
            product.name = customName
        }

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

