#!/usr/bin/env tsx

/**
 * Fix Appwrite Collection Permissions
 */

import { Client, Databases, Permission, Role } from 'node-appwrite'
import { config } from 'dotenv'

config({ path: '.env.local' })

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

const COLLECTIONS = {
    PROPERTIES: 'properties',
    FAVORITES: 'favorites',
    REGIONS: 'regions',
    CITIES: 'cities',
}

console.log('═══════════════════════════════════════════════════════')
console.log('  Fixing Appwrite Collection Permissions')
console.log('═══════════════════════════════════════════════════════\n')

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)

const databases = new Databases(client)

async function updateCollectionPermissions() {
    // Properties: Public read, authenticated users can create/update/delete
    console.log('📋 Updating Properties collection permissions...')
    try {
        await databases.updateCollection(
            DATABASE_ID,
            COLLECTIONS.PROPERTIES,
            'Properties',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ],
            true, // document security
            true  // enabled
        )
        console.log('✅ Properties permissions updated\n')
    } catch (e: any) {
        console.error('❌ Error updating Properties:', e.message, '\n')
    }

    // Favorites: Users can only access their own
    console.log('⭐ Updating Favorites collection permissions...')
    try {
        await databases.updateCollection(
            DATABASE_ID,
            COLLECTIONS.FAVORITES,
            'Favorites',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.delete(Role.users()),
            ],
            true,
            true
        )
        console.log('✅ Favorites permissions updated\n')
    } catch (e: any) {
        console.error('❌ Error updating Favorites:', e.message, '\n')
    }

    // Regions: Public read
    console.log('🌍 Updating Regions collection permissions...')
    try {
        await databases.updateCollection(
            DATABASE_ID,
            COLLECTIONS.REGIONS,
            'Regions',
            [
                Permission.read(Role.any()),
            ],
            false, // no document security for read-only data
            true
        )
        console.log('✅ Regions permissions updated\n')
    } catch (e: any) {
        console.error('❌ Error updating Regions:', e.message, '\n')
    }

    // Cities: Public read
    console.log('🏙️  Updating Cities collection permissions...')
    try {
        await databases.updateCollection(
            DATABASE_ID,
            COLLECTIONS.CITIES,
            'Cities',
            [
                Permission.read(Role.any()),
            ],
            false,
            true
        )
        console.log('✅ Cities permissions updated\n')
    } catch (e: any) {
        console.error('❌ Error updating Cities:', e.message, '\n')
    }
}

async function testPermissions() {
    console.log('🧪 Testing permissions...\n')

    // Test reading properties
    try {
        const props = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROPERTIES, [])
        console.log(`✅ Can read Properties: Found ${props.total} properties`)
    } catch (e: any) {
        console.error(`❌ Cannot read Properties: ${e.message}`)
    }

    // Test reading regions
    try {
        const regions = await databases.listDocuments(DATABASE_ID, COLLECTIONS.REGIONS, [])
        console.log(`✅ Can read Regions: Found ${regions.total} regions`)
    } catch (e: any) {
        console.error(`❌ Cannot read Regions: ${e.message}`)
    }

    // Test reading cities
    try {
        const cities = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITIES, [])
        console.log(`✅ Can read Cities: Found ${cities.total} cities`)
    } catch (e: any) {
        console.error(`❌ Cannot read Cities: ${e.message}`)
    }

    // Test reading favorites
    try {
        const favs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FAVORITES, [])
        console.log(`✅ Can read Favorites: Found ${favs.total} favorites`)
    } catch (e: any) {
        console.error(`❌ Cannot read Favorites: ${e.message}`)
    }
}

async function main() {
    try {
        await updateCollectionPermissions()
        await testPermissions()

        console.log('\n═══════════════════════════════════════════════════════')
        console.log('✅ Permissions fixed successfully!')
        console.log('═══════════════════════════════════════════════════════')
        console.log('\nYou can now:')
        console.log('1. Visit http://localhost:3000')
        console.log('2. Properties should now be visible!')
        console.log('3. Check the browser console for any remaining errors')
    } catch (error: any) {
        console.error('\n❌ Error:', error.message)
        process.exit(1)
    }
}

main()
