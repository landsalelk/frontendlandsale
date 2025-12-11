#!/usr/bin/env tsx

import { Client, Databases } from 'node-appwrite'
import { config } from 'dotenv'

config({ path: '.env.local' })

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)

const databases = new Databases(client)
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

async function diagnose() {
    console.log('🔍 Diagnosing Appwrite Setup\n')
    console.log('Config:')
    console.log('- Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    console.log('- Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    console.log('- Database:', DATABASE_ID)
    console.log('')

    try {
        // Check if database exists
        console.log('📦 Checking database...')
        const db = await databases.get(DATABASE_ID)
        console.log(`✅ Database "${db.name}" exists (ID: ${db.$id})`)
        console.log('')

        // List all collections
        console.log('📋 Listing collections...')
        const collections = await databases.listCollections(DATABASE_ID)
        console.log(`Found ${collections.total} collections:`)

        for (const coll of collections.collections) {
            console.log(`\n  📁 ${coll.name} (${coll.$id})`)
            console.log(`     - Enabled: ${coll.enabled}`)
            console.log(`     - Document Security: ${coll.documentSecurity}`)
            console.log(`     - Permissions:`, coll.$permissions)

            // Try to count documents
            try {
                const docs = await databases.listDocuments(DATABASE_ID, coll.$id, [])
                console.log(`     - Documents: ${docs.total}`)
            } catch (e: any) {
                console.log(`     - Documents: ERROR - ${e.message}`)
            }
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message)
        if (error.response) {
            console.error('Response:', error.response)
        }
    }
}

diagnose()
