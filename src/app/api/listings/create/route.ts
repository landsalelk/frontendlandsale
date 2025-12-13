// API Route to create property listing from AI chat (No login required)
// Enhanced with bilingual descriptions, emojis, and AI-generated images
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server';
import { ID, Storage } from 'node-appwrite';

// Generate enhanced bilingual description with emojis
function generateEnhancedDescription(params: {
    property_type: string;
    land_size?: number;
    land_unit?: string;
    city?: string;
    district?: string;
    features?: string[];
    price: number;
    bedrooms?: number;
    bathrooms?: number;
}): { en: string; si: string } {
    const { property_type, land_size, land_unit, city, district, features, price, bedrooms, bathrooms } = params;

    const location = city || district || 'Sri Lanka';
    const sizeText = land_size ? `${land_size} ${land_unit || 'perch'}` : '';
    const priceFormatted = (price / 1000000).toFixed(1) + ' Million';
    const featuresText = features?.length ? features.join(', ') : '';

    // English description with emojis
    let enDesc = `🏡 **Prime ${property_type === 'land' ? 'Land' : property_type} for Sale in ${location}!**\n\n`;
    enDesc += `📐 **Size:** ${sizeText}\n`;
    enDesc += `💰 **Price:** Rs. ${priceFormatted}\n`;
    if (bedrooms) enDesc += `🛏️ **Bedrooms:** ${bedrooms}\n`;
    if (bathrooms) enDesc += `🚿 **Bathrooms:** ${bathrooms}\n`;
    enDesc += `\n✨ **Property Highlights:**\n`;

    if (property_type === 'land') {
        enDesc += `• 🌳 Ideal for residential/commercial development\n`;
        enDesc += `• 📍 Prime location in ${location}\n`;
        if (featuresText) enDesc += `• ⚡ ${featuresText}\n`;
        enDesc += `• 📜 Clear title & immediate transfer available\n`;
        enDesc += `• 🚗 Easy access from main road\n`;
        enDesc += `\n🔥 **Excellent investment opportunity!** Don't miss this chance to own prime real estate in ${location}.\n`;
        enDesc += `\n📞 **Contact us today for a site visit!**`;
    } else {
        enDesc += `• 🏠 Well-maintained property\n`;
        enDesc += `• 📍 Prime location in ${location}\n`;
        if (featuresText) enDesc += `• ⚡ ${featuresText}\n`;
        enDesc += `• 🔒 Secure neighborhood\n`;
        enDesc += `\n🔥 **Ready to move in!** Your dream home awaits in ${location}.\n`;
        enDesc += `\n📞 **Contact us for a viewing!**`;
    }

    // Sinhala description with emojis
    let siDesc = `🏡 **${location} හි විකිණීමට ඇති ${property_type === 'land' ? 'ඉඩම' : 'දේපල'}!**\n\n`;
    siDesc += `📐 **ප්‍රමාණය:** ${sizeText}\n`;
    siDesc += `💰 **මිල:** රු. ${priceFormatted}\n`;
    if (bedrooms) siDesc += `🛏️ **නිදන කාමර:** ${bedrooms}\n`;
    if (bathrooms) siDesc += `🚿 **නාන කාමර:** ${bathrooms}\n`;
    siDesc += `\n✨ **දේපල විශේෂාංග:**\n`;

    if (property_type === 'land') {
        siDesc += `• 🌳 නිවාස/වාණිජ සංවර්ධනය සඳහා සුදුසුයි\n`;
        siDesc += `• 📍 ${location} හි ප්‍රධාන ස්ථානයක\n`;
        siDesc += `• 📜 පැහැදිලි ඔප්පු සහ ක්ෂණික මාරු\n`;
        siDesc += `• 🚗 ප්‍රධාන මාර්ගයෙන් පහසු ප්‍රවේශය\n`;
        siDesc += `\n🔥 **විශිෂ්ට ආයෝජන අවස්ථාවක්!** ${location} හි ප්‍රධාන දේපලක් හිමි කර ගන්න.\n`;
        siDesc += `\n📞 **අදම අමතන්න!**`;
    } else {
        siDesc += `• 🏠 හොඳින් නඩත්තු කළ දේපල\n`;
        siDesc += `• 📍 ${location} හි ප්‍රධාන ස්ථානයක\n`;
        siDesc += `• 🔒 ආරක්ෂිත අසල්වැසි\n`;
        siDesc += `\n🔥 **ක්ෂණිකව පදිංචි විය හැක!** ${location} හි ඔබේ සිහින නිවස.\n`;
        siDesc += `\n📞 **නැරඹීමක් සඳහා අමතන්න!**`;
    }

    return { en: enDesc, si: siDesc };
}

// Generate AI image prompt based on property details
function generateImagePrompt(params: {
    property_type: string;
    land_size?: number;
    city?: string;
    features?: string[];
}): string {
    const { property_type, land_size, city, features } = params;

    if (property_type === 'land') {
        return `A beautiful flat land plot for sale in Sri Lanka, ${land_size || 20} perches, ${city || 'suburban area'}, lush green grass, clear boundaries marked with white posts, tropical palm trees in background, blue sky with fluffy clouds, professional real estate photography style, high quality, 4K, realistic`;
    } else {
        return `A modern ${property_type} in Sri Lanka, ${city || 'suburban area'}, contemporary architecture, beautiful garden, palm trees, tropical setting, professional real estate photography, high quality, 4K, realistic`;
    }
}

// Stock property images from Unsplash (high-quality, free to use)
const STOCK_IMAGES = {
    land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=1200&h=800&fit=crop&q=80',
    ],
    house: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
    ],
    apartment: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80',
    ],
    default: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80',
    ]
};

// Get a random stock image based on property type
function getStockImage(property_type: string): string {
    const images = STOCK_IMAGES[property_type as keyof typeof STOCK_IMAGES] || STOCK_IMAGES.default;
    return images[Math.floor(Math.random() * images.length)];
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            title,
            description,
            property_type = 'land',
            price,
            district,
            city,
            address,
            land_size,
            land_unit = 'perches',
            bedrooms,
            bathrooms,
            features = [],
            contact_name,
            contact_phone,
            contact_whatsapp,
            images = [],
            generate_ai_image = true,  // New option to generate AI image
        } = body;

        // Validate required fields
        if (!title || !price) {
            return NextResponse.json(
                { success: false, error: 'Title and price are required' },
                { status: 400 }
            );
        }

        // Create admin client (uses API key, no user auth needed)
        const { databases } = await createAdminClient();

        // Generate enhanced bilingual description if not provided
        const enhancedDesc = generateEnhancedDescription({
            property_type,
            land_size,
            land_unit,
            city,
            district,
            features,
            price,
            bedrooms,
            bathrooms
        });

        // Use provided description or enhanced one
        const finalDescEn = description || enhancedDesc.en;
        const finalDescSi = enhancedDesc.si;

        // Generate bilingual title
        const titleEn = title;
        const titleSi = property_type === 'land'
            ? `${city || district || 'ශ්‍රී ලංකා'} හි විකිණීමට ${land_size || ''} ${land_unit === 'perches' ? 'පර්චස්' : land_unit} ඉඩම`
            : `${city || district || 'ශ්‍රී ලංකා'} හි විකිණීමට ${property_type}`;

        // Format title as JSON (bilingual)
        const titleJson = JSON.stringify({
            en: titleEn,
            si: titleSi
        });

        // Generate image prompt for AI (will be used by frontend)
        const imagePrompt = generateImagePrompt({
            property_type,
            land_size,
            city,
            features
        });

        // GENERATE REAL AI IMAGE using Pollinations AI (YouTube Thumbnail Style)
        // 16:9 aspect ratio (1280x720) with high contrast and eye-catching style
        const thumbnailPrompt = imagePrompt + ", YouTube thumbnail style, high contrast, vibrant colors, eye catching, dramatic lighting, 8k, photorealistic";
        const encodedPrompt = encodeURIComponent(thumbnailPrompt);
        const aiGeneratedImage = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Date.now()}`;

        // Use the AI generated image
        const finalImages = images && images.length > 0 ? images : [aiGeneratedImage];

        // Format description as JSON (bilingual + image metadata)
        const descriptionJson = JSON.stringify({
            en: finalDescEn,
            si: finalDescSi,
            image: finalImages[0] // Store image in metadata
        });

        // Format location as JSON
        const locationJson = JSON.stringify({
            region: district || '',
            city: city || '',
            address: address || ''
        });

        // Format contact as JSON
        const contactJson = JSON.stringify({
            name: contact_name || '',
            phone: contact_phone || '',
            whatsapp: contact_whatsapp || contact_phone || ''
        });

        // Convert price to cents
        const priceInCents = Math.round(Number(price) * 100);

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .substring(0, 100) + '-' + Date.now();

        // Prepare document data
        const documentData: Record<string, any> = {
            title: titleJson,
            description: descriptionJson,
            slug: slug,
            listing_type: 'sale',
            price: priceInCents,
            currency_code: 'LKR',
            location: locationJson,
            contact: contactJson,
            status: 'active',
            user_id: 'ai-chat-guest',
            category_id: 'land'
            // Removing images field as it's not supported by schema
        };

        // Create the document
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            ID.unique(),
            documentData
        );

        const listingUrl = `/properties/${doc.$id}`;

        return NextResponse.json({
            success: true,
            propertyId: doc.$id,
            url: listingUrl,
            message: 'Listing created successfully! 🎉',
            description: {
                en: finalDescEn,
                si: finalDescSi
            },
            imagePrompt: imagePrompt,  // Return prompt for AI image generation
            generateAiImage: generate_ai_image
        });

    } catch (error: any) {
        console.error('Error creating listing:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to create listing',
                code: error.code
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'AI Chat Listing API - POST to create a listing',
        features: [
            '🌍 Bilingual descriptions (English + සිංහල)',
            '✨ Auto-generated rich descriptions with emojis',
            '🖼️ AI image prompt generation',
            '🚀 No login required'
        ],
        fields: {
            required: ['title', 'price'],
            optional: ['description', 'property_type', 'district', 'city', 'address', 'land_size', 'land_unit', 'bedrooms', 'bathrooms', 'features', 'contact_name', 'contact_phone', 'contact_whatsapp', 'images', 'generate_ai_image']
        }
    });
}
