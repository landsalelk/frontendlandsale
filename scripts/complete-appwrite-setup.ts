#!/usr/bin/env tsx

/**
 * Complete Appwrite Setup Script
 * Creates database, collections, and migrates data from Supabase
 */

import { Client, Databases, Storage, ID, IndexType, Permission, Role } from 'node-appwrite'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Collection IDs
const COLLECTIONS = {
    PROPERTIES: process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || 'properties',
    FAVORITES: process.env.NEXT_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || 'favorites',
    REGIONS: process.env.NEXT_PUBLIC_APPWRITE_REGIONS_COLLECTION_ID || 'regions',
    CITIES: process.env.NEXT_PUBLIC_APPWRITE_CITIES_COLLECTION_ID || 'cities',
}

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'property_images'

console.log('═══════════════════════════════════════════════════════')
console.log('  Complete Appwrite Setup & Data Migration')
console.log('═══════════════════════════════════════════════════════')
console.log(`  Endpoint: ${APPWRITE_ENDPOINT}`)
console.log(`  Project:  ${APPWRITE_PROJECT_ID}`)
console.log(`  Database: ${DATABASE_ID}`)
console.log('')

if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY is required')
    console.log('   Set it in your .env.local file')
    process.exit(1)
}

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)

// Initialize Supabase client if credentials are available
let supabase: any = null
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('✅ Supabase client initialized for data migration')
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function createDatabaseIfNeeded() {
    console.log('\n📦 Step 1: Creating database...')
    try {
        await databases.get(DATABASE_ID)
        console.log(`✅ Database "${DATABASE_ID}" already exists`)
    } catch (error: any) {
        if (error.code === 404) {
            try {
                await databases.create(DATABASE_ID, 'LandSale Database')
                console.log(`✅ Database "${DATABASE_ID}" created successfully`)
            } catch (createError: any) {
                console.error(`❌ Failed to create database: ${createError.message}`)
                throw createError
            }
        } else {
            console.error(`❌ Error checking database: ${error.message}`)
            throw error
        }
    }
}

async function createPropertiesCollection() {
    console.log('\n📋 Step 2: Creating Properties collection...')
    try {
        await databases.getCollection(DATABASE_ID, COLLECTIONS.PROPERTIES)
        console.log(`✅ Properties collection already exists`)
        return
    } catch (error: any) {
        if (error.code !== 404) throw error
    }

    // Create collection
    const collection = await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.PROPERTIES,
        'Properties',
        [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    )
    console.log('✅ Collection created')

    // Create attributes
    const attributes = [
        { key: 'user_id', type: 'string', size: 36, required: true },
        { key: 'type', type: 'enum', elements: ['land', 'house', 'commercial'], required: true },
        { key: 'district', type: 'string', size: 100, required: true },
        { key: 'city', type: 'string', size: 100, required: true },
        { key: 'address', type: 'string', size: 500, required: false },
        { key: 'title', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 10000, required: true },
        { key: 'price', type: 'integer', required: true },
        { key: 'price_negotiable', type: 'boolean', required: false, default: false },
        { key: 'size', type: 'string', size: 50, required: true },
        { key: 'bedrooms', type: 'integer', required: false },
        { key: 'bathrooms', type: 'integer', required: false },
        { key: 'features', type: 'string', size: 255, required: false, array: true },
        { key: 'images', type: 'string', size: 2048, required: false, array: true },
        { key: 'contact_name', type: 'string', size: 100, required: true },
        { key: 'contact_phone', type: 'string', size: 20, required: true },
        { key: 'contact_email', type: 'email', required: false },
        { key: 'whatsapp', type: 'string', size: 20, required: false },
        { key: 'status', type: 'enum', elements: ['active', 'pending', 'sold', 'rejected'], required: false, default: 'pending' },
        { key: 'is_featured', type: 'boolean', required: false, default: false },
        { key: 'views', type: 'integer', required: false, default: 0 },
    ]

    for (const attr of attributes) {
        try {
            if (attr.type === 'string' && attr.array) {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    attr.key,
                    attr.size!,
                    attr.required,
                    undefined,
                    true // array
                )
            } else if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    attr.key,
                    attr.size!,
                    attr.required
                )
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    undefined
                )
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    attr.key,
                    attr.required,
                    attr.default as boolean | undefined
                )
            } else if (attr.type === 'enum') {
                await databases.createEnumAttribute(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    attr.key,
                    attr.elements!,
                    attr.required,
                    attr.default as string | undefined
                )
            } else if (attr.type === 'email') {
                await databases.createEmailAttribute(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    attr.key,
                    attr.required
                )
            }
            console.log(`  ✅ Created attribute: ${attr.key}`)
            await sleep(100) // Small delay between attribute creations
        } catch (error: any) {
            console.log(`  ⚠️  Attribute ${attr.key} might already exist: ${error.message}`)
        }
    }

    // Create indexes
    await sleep(2000) // Wait for attributes to be ready
    try {
        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.PROPERTIES,
            'user_id_idx',
            IndexType.Key,
            ['user_id']
        )
        console.log('  ✅ Created index: user_id_idx')
    } catch (e) {
        console.log('  ⚠️  Index user_id_idx might already exist')
    }

    try {
        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.PROPERTIES,
            'status_idx',
            IndexType.Key,
            ['status']
        )
        console.log('  ✅ Created index: status_idx')
    } catch (e) {
        console.log('  ⚠️  Index status_idx might already exist')
    }
}

async function createFavoritesCollection() {
    console.log('\n⭐ Step 3: Creating Favorites collection...')
    try {
        await databases.getCollection(DATABASE_ID, COLLECTIONS.FAVORITES)
        console.log(`✅ Favorites collection already exists`)
        return
    } catch (error: any) {
        if (error.code !== 404) throw error
    }

    await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        'Favorites',
        [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.delete(Role.users()),
        ]
    )

    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.FAVORITES, 'user_id', 36, true)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.FAVORITES, 'property_id', 36, true)
    console.log('✅ Favorites collection created')
}

async function createRegionsCollection() {
    console.log('\n🌍 Step 4: Creating Regions collection...')
    try {
        await databases.getCollection(DATABASE_ID, COLLECTIONS.REGIONS)
        console.log(`✅ Regions collection already exists`)
        return
    } catch (error: any) {
        if (error.code !== 404) throw error
    }

    await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.REGIONS,
        'Regions',
        [Permission.read(Role.any())]
    )

    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.REGIONS, 'id', true)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.REGIONS, 'country_code', 2, false)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.REGIONS, 'name', 60, true)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.REGIONS, 'slug', 60, false)
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.REGIONS, 'active', false, true)
    console.log('✅ Regions collection created')
}

async function createCitiesCollection() {
    console.log('\n🏙️  Step 5: Creating Cities collection...')
    try {
        await databases.getCollection(DATABASE_ID, COLLECTIONS.CITIES)
        console.log(`✅ Cities collection already exists`)
        return
    } catch (error: any) {
        if (error.code !== 404) throw error
    }

    await databases.createCollection(
        DATABASE_ID,
        COLLECTIONS.CITIES,
        'Cities',
        [Permission.read(Role.any())]
    )

    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'id', true)
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'region_id', true)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'country_code', 2, false)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'name', 60, true)
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'slug', 60, false)
    await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'lat', false)
    await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'lng', false)
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.CITIES, 'active', false, true)
    console.log('✅ Cities collection created')
}

async function createStorageBucket() {
    console.log('\n📸 Step 6: Creating Storage bucket...')
    try {
        await storage.getBucket(BUCKET_ID)
        console.log(`✅ Bucket "${BUCKET_ID}" already exists`)
    } catch (error: any) {
        if (error.code === 404) {
            await storage.createBucket(
                BUCKET_ID,
                'Property Images',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.delete(Role.users()),
                ],
                false, // file security disabled for simplicity
                true, // enabled
                10485760, // 10MB max file size
                ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                undefined,
                undefined,
                true // encryption
            )
            console.log(`✅ Bucket "${BUCKET_ID}" created`)
        } else {
            throw error
        }
    }
}

async function migrateData() {
    if (!supabase) {
        console.log('\n⚠️  Skipping data migration (Supabase credentials not found)')
        return
    }

    console.log('\n🔄 Step 7: Migrating data from Supabase...')

    // Migrate regions
    console.log('  📍 Migrating regions...')
    const { data: regions } = await supabase.from('regions').select('*')
    if (regions && regions.length > 0) {
        for (const region of regions) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.REGIONS,
                    ID.unique(),
                    {
                        id: region.id,
                        country_code: region.country_code,
                        name: region.name,
                        slug: region.slug,
                        active: region.active ?? true,
                    }
                )
            } catch (e) {
                console.log(`    ⚠️  Region ${region.name} might already exist`)
            }
        }
        console.log(`  ✅ Migrated ${regions.length} regions`)
    }

    // Migrate cities
    console.log('  🏙️  Migrating cities...')
    const { data: cities } = await supabase.from('cities').select('*')
    if (cities && cities.length > 0) {
        for (const city of cities) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.CITIES,
                    ID.unique(),
                    {
                        id: city.id,
                        region_id: city.region_id,
                        country_code: city.country_code,
                        name: city.name,
                        slug: city.slug,
                        lat: city.lat,
                        lng: city.lng,
                        active: city.active ?? true,
                    }
                )
            } catch (e) {
                // Skip duplicates
            }
        }
        console.log(`  ✅ Migrated ${cities.length} cities`)
    }

    // Migrate properties
    console.log('  🏠 Migrating properties...')
    const { data: properties } = await supabase.from('properties').select('*').limit(100) // Limit for testing
    if (properties && properties.length > 0) {
        for (const prop of properties) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.PROPERTIES,
                    ID.unique(),
                    {
                        user_id: prop.user_id,
                        type: prop.type,
                        district: prop.district,
                        city: prop.city,
                        address: prop.address,
                        title: prop.title,
                        description: prop.description,
                        price: parseInt(prop.price),
                        price_negotiable: prop.price_negotiable ?? false,
                        size: prop.size,
                        bedrooms: prop.bedrooms,
                        bathrooms: prop.bathrooms,
                        features: prop.features || [],
                        images: prop.images || [],
                        contact_name: prop.contact_name,
                        contact_phone: prop.contact_phone,
                        contact_email: prop.contact_email,
                        whatsapp: prop.whatsapp,
                        status: prop.status || 'pending',
                        is_featured: prop.is_featured ?? false,
                        views: prop.views || 0,
                    }
                )
            } catch (e: any) {
                console.log(`    ⚠️  Failed to migrate property ${prop.title}: ${e.message}`)
            }
        }
        console.log(`  ✅ Migrated ${properties.length} properties`)
    }

    // Migrate favorites
    console.log('  ⭐ Migrating favorites...')
    const { data: favorites } = await supabase.from('favorites').select('*').limit(100)
    if (favorites && favorites.length > 0) {
        for (const fav of favorites) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.FAVORITES,
                    ID.unique(),
                    {
                        user_id: fav.user_id,
                        property_id: fav.property_id,
                    }
                )
            } catch (e) {
                // Skip duplicates
            }
        }
        console.log(`  ✅ Migrated ${favorites.length} favorites`)
    }
}

async function main() {
    try {
        await createDatabaseIfNeeded()
        await createPropertiesCollection()
        await createFavoritesCollection()
        await createRegionsCollection()
        await createCitiesCollection()
        await createStorageBucket()
        await migrateData()

        console.log('\n═══════════════════════════════════════════════════════')
        console.log('✅ Setup and migration completed successfully!')
        console.log('═══════════════════════════════════════════════════════')
        console.log('\nNext steps:')
        console.log('1. Restart your Next.js dev server')
        console.log('2. Visit http://localhost:3000 to test')
        console.log('3. Check the Appwrite console to verify data')
    } catch (error: any) {
        console.error('\n❌ Error during setup:', error.message)
        console.error('Error details:', error)
        process.exit(1)
    }
}

main()
