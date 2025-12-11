/**
 * Appwrite Collection Setup Script
 * 
 * This script creates the required database and collections in Appwrite.
 * Run this ONCE before running the migration script.
 * 
 * Run with: npx tsx scripts/setup-appwrite-collections.ts
 */

import { Client, Databases, ID, IndexType } from 'node-appwrite'

// ===========================================
// CONFIGURATION
// ===========================================

const APPWRITE_CONFIG = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6938b2b200372bde48f0',
    apiKey: process.env.APPWRITE_API_KEY || '',
}

const DATABASE_ID = 'landsale_db'

const COLLECTIONS = {
    listings: 'listings',
    favorites: 'favorites',
    regions: 'regions',
    cities: 'cities',
}

// ===========================================
// INITIALIZE CLIENT
// ===========================================

function createAppwriteClient() {
    if (!APPWRITE_CONFIG.apiKey) {
        console.error('❌ APPWRITE_API_KEY is required')
        console.error('   Set it in your environment: export APPWRITE_API_KEY=your_key')
        process.exit(1)
    }

    const client = new Client()
        .setEndpoint(APPWRITE_CONFIG.endpoint)
        .setProject(APPWRITE_CONFIG.projectId)
        .setKey(APPWRITE_CONFIG.apiKey)

    return new Databases(client)
}

// ===========================================
// SETUP FUNCTIONS
// ===========================================

async function createDatabase(databases: Databases) {
    console.log('\n📦 Creating database...')

    try {
        const db = await databases.create(DATABASE_ID, 'LandSale Database')
        console.log(`  ✓ Database created: ${db.$id}`)
        return db
    } catch (error: any) {
        if (error.code === 409) {
            console.log('  ℹ️  Database already exists')
            return { $id: DATABASE_ID }
        }
        throw error
    }
}

async function createPropertiesCollection(databases: Databases) {
    console.log('\n🏠 Creating LISTINGS collection...')

    try {
        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.listings,
            'Listings',
            [
                'read("any")',
                'create("users")',
                'update("users")',
                'delete("users")',
            ]
        )
        console.log('  ✓ Collection created')

        // Add attributes matching src/lib/actions/property.ts
        console.log('  Adding attributes...')

        // Core Identifiers
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'user_id', 36, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'slug', 255, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'status', 50, true, 'pending')
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'listing_type', 50, true, 'sale')

        // JSON Fields (Big strings)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'title', 5000, true) // JSON { en: "..." }
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'description', 10000, true) // JSON { en: "..." }
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'location', 5000, true) // JSON { region, city, address... }
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'contact', 5000, true) // JSON { name, phone... }
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'attributes', 5000, true) // JSON { bedrooms, bathrooms, size... }

        // Financials
        await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.listings, 'price', true) // Cents
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'currency_code', 10, true, 'LKR')
        await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.listings, 'price_negotiable', false, false)

        // Metadata
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'features', 255, false, undefined, true) // Array
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'images', 5000, false, undefined, true) // Array used for URLs
        await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.listings, 'views_count', false, 0)
        await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.listings, 'is_premium', false, false)
        await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.listings, 'auction_enabled', false, false)
        await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.listings, 'bid_count', false, 0)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.listings, 'ip_address', 45, false)

        console.log('  ✓ All attributes created')

        // Wait for attributes to be processed
        console.log('  ⏳ Waiting for attributes to be ready...')
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Create indexes
        console.log('  Creating indexes...')
        await databases.createIndex(DATABASE_ID, COLLECTIONS.listings, 'user_id_idx', IndexType.Key, ['user_id'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.listings, 'status_idx', IndexType.Key, ['status'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.listings, 'listing_type_idx', IndexType.Key, ['listing_type'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.listings, 'slug_idx', IndexType.Unique, ['slug'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.listings, 'price_idx', IndexType.Key, ['price'])

        console.log('  ✓ Listings collection setup complete')

    } catch (error: any) {
        if (error.code === 409) {
            console.log('  ℹ️  Listings collection already exists')
        } else {
            throw error
        }
    }
}

async function createFavoritesCollection(databases: Databases) {
    console.log('\n❤️  Creating favorites collection...')

    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.favorites,
            'Favorites',
            [
                'read("users")',
                'create("users")',
                'delete("users")',
            ]
        )
        console.log('  ✓ Collection created')

        console.log('  Adding attributes...')
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.favorites, 'user_id', 36, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.favorites, 'property_id', 36, true)

        console.log('  ⏳ Waiting for attributes to be ready...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('  Creating indexes...')
        await databases.createIndex(DATABASE_ID, COLLECTIONS.favorites, 'user_id_idx', IndexType.Key, ['user_id'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.favorites, 'property_user_idx', IndexType.Key, ['property_id', 'user_id'])

        console.log('  ✓ Favorites collection setup complete')

    } catch (error: any) {
        if (error.code === 409) {
            console.log('  ℹ️  Favorites collection already exists')
        } else {
            throw error
        }
    }
}

async function createRegionsCollection(databases: Databases) {
    console.log('\n📍 Creating regions collection...')

    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.regions,
            'Regions',
            ['read("any")']  // Read-only for everyone
        )
        console.log('  ✓ Collection created')

        console.log('  Adding attributes...')
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.regions, 'name', 100, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.regions, 'slug', 100, true)
        await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.regions, 'active', true, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.regions, 'legacy_id', 50, false)

        console.log('  ⏳ Waiting for attributes to be ready...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('  Creating indexes...')
        await databases.createIndex(DATABASE_ID, COLLECTIONS.regions, 'slug_idx', IndexType.Unique, ['slug'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.regions, 'active_idx', IndexType.Key, ['active'])

        console.log('  ✓ Regions collection setup complete')

    } catch (error: any) {
        if (error.code === 409) {
            console.log('  ℹ️  Regions collection already exists')
        } else {
            throw error
        }
    }
}

async function createCitiesCollection(databases: Databases) {
    console.log('\n🏙️  Creating cities collection...')

    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.cities,
            'Cities',
            ['read("any")']  // Read-only for everyone
        )
        console.log('  ✓ Collection created')

        console.log('  Adding attributes...')
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.cities, 'name', 100, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.cities, 'slug', 100, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.cities, 'region_id', 36, true)
        await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.cities, 'active', true, true)
        await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.cities, 'legacy_id', 50, false)

        console.log('  ⏳ Waiting for attributes to be ready...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('  Creating indexes...')
        await databases.createIndex(DATABASE_ID, COLLECTIONS.cities, 'region_id_idx', IndexType.Key, ['region_id'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.cities, 'active_idx', IndexType.Key, ['active'])
        await databases.createIndex(DATABASE_ID, COLLECTIONS.cities, 'region_active_idx', IndexType.Key, ['region_id', 'active'])

        console.log('  ✓ Cities collection setup complete')

    } catch (error: any) {
        if (error.code === 409) {
            console.log('  ℹ️  Cities collection already exists')
        } else {
            throw error
        }
    }
}

// ===========================================
// MAIN EXECUTION
// ===========================================

async function main() {
    console.log('═══════════════════════════════════════════════════════')
    console.log('  Appwrite Collection Setup for LandSale.lk')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`  Endpoint: ${APPWRITE_CONFIG.endpoint}`)
    console.log(`  Project:  ${APPWRITE_CONFIG.projectId}`)
    console.log(`  Database: ${DATABASE_ID}`)

    const databases = createAppwriteClient()

    try {
        await createDatabase(databases)
        await createPropertiesCollection(databases)
        await createFavoritesCollection(databases)
        await createRegionsCollection(databases)
        await createCitiesCollection(databases)

        console.log('\n═══════════════════════════════════════════════════════')
        console.log('  ✅ ALL COLLECTIONS CREATED SUCCESSFULLY!')
        console.log('═══════════════════════════════════════════════════════')
        console.log('\n📝 Next steps:')
        console.log('   1. Run the migration script: npx tsx scripts/migrate-to-appwrite.ts')
        console.log('   2. Update your frontend code to use Appwrite')
        console.log('')

    } catch (error: any) {
        console.error('\n❌ Setup failed:', error.message)
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response, null, 2))
        }
        process.exit(1)
    }
}

main().catch(console.error)
