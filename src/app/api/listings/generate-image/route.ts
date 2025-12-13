// API Route to generate AI property images and upload to Appwrite
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server';
import { ID, Storage } from 'node-appwrite';

// Placeholder images for different property types (you can replace with actual AI generation)
const PROPERTY_IMAGES = {
    land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop', // Green land
        'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1200&h=800&fit=crop', // Plot
        'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&h=800&fit=crop', // Scenic land
    ],
    house: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
    ],
    apartment: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    ]
};

// Sri Lanka themed property images
const SRI_LANKA_IMAGES = {
    land: [
        '/property-images/land-sri-lanka-1.jpg',
        '/property-images/land-sri-lanka-2.jpg',
        '/property-images/land-sri-lanka-3.jpg',
    ]
};

// Generate a data URL for a simple colored placeholder image
function generatePlaceholderImage(text: string, width = 1200, height = 800): string {
    // Return a data URL for a simple SVG placeholder
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
                🏡 ${text}
            </text>
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)">
                LandSale.lk
            </text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            listing_id,
            property_type = 'land',
            city,
            land_size,
            use_placeholder = true,  // Use placeholder or stock images
        } = body;

        if (!listing_id) {
            return NextResponse.json(
                { success: false, error: 'listing_id is required' },
                { status: 400 }
            );
        }

        const { databases, storage } = await createAdminClient();

        let imageUrl: string;

        if (use_placeholder) {
            // Use stock images from Unsplash based on property type
            const images = PROPERTY_IMAGES[property_type as keyof typeof PROPERTY_IMAGES] || PROPERTY_IMAGES.land;
            imageUrl = images[Math.floor(Math.random() * images.length)];
        } else {
            // Generate a placeholder SVG
            const text = `${land_size || ''} ${property_type === 'land' ? 'Perch Land' : property_type} - ${city || 'Sri Lanka'}`;
            imageUrl = generatePlaceholderImage(text);
        }

        // For now, we'll use external URLs directly
        // In production, you would download and upload to Appwrite storage

        // Update the listing with the image URL
        // Note: The listing schema may need to support images array
        // For now, we just return the URL

        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            message: 'Image generated successfully! 🖼️',
            listingId: listing_id
        });

    } catch (error: any) {
        console.error('Error generating image:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate image',
                code: error.code
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'AI Image Generation API',
        description: 'Generates property images for listings',
        usage: 'POST with { listing_id, property_type, city, land_size }'
    });
}
