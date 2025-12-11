/**
 * Data Migration Script: Supabase to Appwrite
 * 
 * This script migrates data from your Supabase PostgreSQL database
 * to Appwrite collections.
 * 
 * Run with: npx tsx scripts/migrate-to-appwrite.ts
 */

import { Client, Databases, ID, Storage } from 'node-appwrite'
import { createClient } from '@supabase/supabase-js'

// ===========================================
// CONFIGURATION - Update these values
// ===========================================

const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}

const APPWRITE_CONFIG = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6938b2b200372bde48f0',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsale_db',
}

const COLLECTIONS = {
    LISTINGS: process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings',
    FAVORITES: process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || 'favorites',
    REGIONS: process.env.NEXT_PUBLIC_APPWRITE_REGIONS_COLLECTION_ID || 'regions',
    CITIES: process.env.NEXT_PUBLIC_APPWRITE_CITIES_COLLECTION_ID || 'cities',
}

// ===========================================
// INITIALIZE CLIENTS
// ===========================================

function validateConfig() {
    const errors: string[] = []

    if (!SUPABASE_CONFIG.url) errors.push('SUPABASE_URL is required')
    if (!SUPABASE_CONFIG.serviceKey) errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
    if (!APPWRITE_CONFIG.apiKey) errors.push('APPWRITE_API_KEY is required')

    if (errors.length > 0) {
        console.error('❌ Configuration errors:')
        errors.forEach(e => console.error(`   - ${e}`))
        console.error('\nPlease set the required environment variables.')
        process.exit(1)
    }
}

function createSupabaseClient() {
    return createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey)
}

function createAppwriteClient() {
    const client = new Client()
        .setEndpoint(APPWRITE_CONFIG.endpoint)
        .setProject(APPWRITE_CONFIG.projectId)
        .setKey(APPWRITE_CONFIG.apiKey)

    return {
        databases: new Databases(client),
        storage: new Storage(client),
    }
}

// ===========================================
// MIGRATION FUNCTIONS
// ===========================================

async function migrateRegions(supabase: ReturnType<typeof createSupabaseClient>, appwrite: ReturnType<typeof createAppwriteClient>) {
    console.log('\n📍 Migrating regions...')

    const { data: regions, error } = await supabase
        .from('regions')
        .select('*')
        .order('name')

    if (error) {
        console.error('  ❌ Failed to fetch regions:', error.message)
        return { success: 0, failed: 0 }
    }

    if (!regions || regions.length === 0) {
        console.log('  ⚠️  No regions found to migrate')
        return { success: 0, failed: 0 }
    }

    let success = 0
    let failed = 0

    for (const region of regions) {
        try {
            await appwrite.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                COLLECTIONS.REGIONS,
                ID.unique(),
                {
                    name: region.name || '',
                    slug: region.slug || region.name?.toLowerCase().replace(/\s+/g, '-') || '',
                    active: region.active ?? true,
                    // Store original ID for reference during cities migration
                    legacy_id: region.id?.toString() || '',
                }
            )
            success++
            process.stdout.write(`\r  ✓ Migrated ${success}/${regions.length} regions`)
        } catch (err: any) {
            failed++
            console.error(`\n  ❌ Failed to migrate region "${region.name}":`, err.message)
        }
    }

    console.log(`\n  ✅ Regions migration complete: ${success} success, ${failed} failed`)
    return { success, failed }
}

async function migrateCities(supabase: ReturnType<typeof createSupabaseClient>, appwrite: ReturnType<typeof createAppwriteClient>) {
    console.log('\n🏙️  Migrating cities...')

    const { data: cities, error } = await supabase
        .from('cities')
        .select('*')
        .order('name')

    if (error) {
        console.error('  ❌ Failed to fetch cities:', error.message)
        return { success: 0, failed: 0 }
    }

    if (!cities || cities.length === 0) {
        console.log('  ⚠️  No cities found to migrate')
        return { success: 0, failed: 0 }
    }

    let success = 0
    let failed = 0

    for (const city of cities) {
        try {
            await appwrite.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                COLLECTIONS.CITIES,
                ID.unique(),
                {
                    name: city.name || '',
                    slug: city.slug || city.name?.toLowerCase().replace(/\s+/g, '-') || '',
                    region_id: city.region_id?.toString() || '',
                    active: city.active ?? true,
                    legacy_id: city.id?.toString() || '',
                }
            )
            success++
            if (success % 50 === 0) {
                process.stdout.write(`\r  ✓ Migrated ${success}/${cities.length} cities`)
            }
        } catch (err: any) {
            failed++
            if (failed <= 5) {
                console.error(`\n  ❌ Failed to migrate city "${city.name}":`, err.message)
            }
        }
    }

    console.log(`\n  ✅ Cities migration complete: ${success} success, ${failed} failed`)
    return { success, failed }
}

async function migrateProperties(supabase: ReturnType<typeof createSupabaseClient>, appwrite: ReturnType<typeof createAppwriteClient>) {
    console.log('\n🏠 Migrating properties to LISTINGS...')

    const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('  ❌ Failed to fetch properties:', error.message)
        return { success: 0, failed: 0 }
    }

    if (!properties || properties.length === 0) {
        console.log('  ⚠️  No properties found to migrate')
        return { success: 0, failed: 0 }
    }

    let success = 0
    let failed = 0

    for (const prop of properties) {
        try {
            // Transform images array if needed
            let images: string[] = []
            if (Array.isArray(prop.images)) {
                images = prop.images
            } else if (typeof prop.images === 'string') {
                try {
                    images = JSON.parse(prop.images)
                } catch {
                    images = [prop.images]
                }
            }

            // Construct JSON fields
            const titleJson = JSON.stringify({ en: prop.title || 'Untitled Property' })
            const descJson = JSON.stringify({ en: prop.description || '' })

            const locationJson = JSON.stringify({
                country: 'LK',
                region: prop.district || prop.region || '',
                city: prop.city || '',
                address: prop.address || '',
                lat: prop.latitude || 0,
                lng: prop.longitude || 0,
            })

            const contactJson = JSON.stringify({
                name: prop.contact_name || 'Owner',
                phone: prop.contact_phone || '',
                whatsapp: prop.whatsapp || prop.contact_phone || '',
                email: prop.contact_email || '',
            })

            const attributesJson = JSON.stringify({
                bedrooms: parseInt(prop.bedrooms) || 0,
                bathrooms: parseInt(prop.bathrooms) || 0,
                size: prop.size?.toString() || '',
            })

            await appwrite.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                COLLECTIONS.LISTINGS,
                ID.unique(),
                {
                    title: titleJson,
                    description: descJson,
                    price: Math.round((parseFloat(prop.price) || 0) * 100), // Convert to cents if needed, check input unit
                    currency_code: 'LKR',
                    listing_type: prop.type || 'sale', // Map 'land', 'house' etc to listing_type if needed, or keep as is
                    status: prop.status || 'pending',
                    price_negotiable: prop.negotiable || false,

                    location: locationJson,
                    contact: contactJson,
                    attributes: attributesJson,

                    images: images,
                    features: prop.features || [], // Ensure array

                    user_id: prop.user_id || '',
                    views_count: parseInt(prop.views) || 0,

                    slug: (prop.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 200) + '-' + Math.random().toString(36).substr(2, 5),
                    legacy_id: prop.id?.toString() || '',
                }
            )
            success++
            if (success % 10 === 0) {
                process.stdout.write(`\r  ✓ Migrated ${success}/${properties.length} properties`)
            }
        } catch (err: any) {
            failed++
            if (failed <= 5) {
                console.error(`\n  ❌ Failed to migrate property "${prop.title}":`, err.message)
            }
        }
    }

    console.log(`\n  ✅ Properties migration complete: ${success} success, ${failed} failed`)
    return { success, failed }
}

async function migrateFavorites(supabase: ReturnType<typeof createSupabaseClient>, appwrite: ReturnType<typeof createAppwriteClient>) {
    console.log('\n❤️  Migrating favorites...')

    const { data: favorites, error } = await supabase
        .from('favorites')
        .select('*')

    if (error) {
        console.error('  ❌ Failed to fetch favorites:', error.message)
        return { success: 0, failed: 0 }
    }

    if (!favorites || favorites.length === 0) {
        console.log('  ⚠️  No favorites found to migrate')
        return { success: 0, failed: 0 }
    }

    let success = 0
    let failed = 0

    for (const fav of favorites) {
        try {
            await appwrite.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                COLLECTIONS.FAVORITES,
                ID.unique(),
                {
                    user_id: fav.user_id || '',
                    property_id: fav.property_id?.toString() || '',
                }
            )
            success++
        } catch (err: any) {
            failed++
        }
    }

    console.log(`  ✅ Favorites migration complete: ${success} success, ${failed} failed`)
    return { success, failed }
}

// ===========================================
// MAIN EXECUTION
// ===========================================

async function main() {
    console.log('═══════════════════════════════════════════════════════')
    console.log('  LandSale.lk Data Migration: Supabase → Appwrite')
    console.log('═══════════════════════════════════════════════════════')

    validateConfig()

    console.log('\n📦 Initializing clients...')
    const supabase = createSupabaseClient()
    const appwrite = createAppwriteClient()

    console.log('  ✓ Supabase client initialized')
    console.log('  ✓ Appwrite client initialized')

    const results = {
        regions: { success: 0, failed: 0 },
        cities: { success: 0, failed: 0 },
        properties: { success: 0, failed: 0 },
        favorites: { success: 0, failed: 0 },
    }

    try {
        results.regions = await migrateRegions(supabase, appwrite)
        results.cities = await migrateCities(supabase, appwrite)
        results.properties = await migrateProperties(supabase, appwrite)
        results.favorites = await migrateFavorites(supabase, appwrite)
    } catch (error: any) {
        console.error('\n❌ Migration failed with error:', error.message)
        process.exit(1)
    }

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  MIGRATION SUMMARY')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`  Regions:    ${results.regions.success} success, ${results.regions.failed} failed`)
    console.log(`  Cities:     ${results.cities.success} success, ${results.cities.failed} failed`)
    console.log(`  Properties: ${results.properties.success} success, ${results.properties.failed} failed`)
    console.log(`  Favorites:  ${results.favorites.success} success, ${results.favorites.failed} failed`)
    console.log('═══════════════════════════════════════════════════════')

    const totalFailed = results.regions.failed + results.cities.failed +
        results.properties.failed + results.favorites.failed

    if (totalFailed > 0) {
        console.log('\n⚠️  Migration completed with some errors. Review the logs above.')
        process.exit(1)
    } else {
        console.log('\n✅ Migration completed successfully!')
    }
}

main().catch(console.error)
