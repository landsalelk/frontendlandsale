// Digital Product Types and Catalog
// Shared between client and server

export type DigitalProductType = 'investment_report' | 'blueprint' | 'raw_images' | 'valuation_report'

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
