#!/usr/bin/env node

/**
 * Appwrite Storage List Script
 * This script lists existing storage buckets
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { Client, Storage } = require('node-appwrite')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

async function listStorageBuckets() {
    console.log('🔍 Listing Appwrite Storage Buckets...')
    
    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables')
        return
    }

    try {
        // Initialize Appwrite client
        const client = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)
            .setKey(APPWRITE_API_KEY)

        const storage = new Storage(client)

        console.log('📡 Connected to Appwrite project:', APPWRITE_PROJECT_ID)

        // List all buckets
        const buckets = await storage.listBuckets()
        
        console.log('\n📊 Storage Buckets:')
        if (buckets.buckets.length === 0) {
            console.log('  ❌ No buckets found')
        } else {
            buckets.buckets.forEach(bucket => {
                console.log(`  📁 ${bucket.name} (${bucket.$id})`)
                console.log(`     Files: ${bucket.files}`)
                console.log(`     Size: ${formatFileSize(bucket.size)}`)
                console.log(`     Extensions: ${bucket.allowedFileExtensions?.join(', ') || 'All'}`)
                console.log(`     Max Size: ${formatFileSize(bucket.maximumFileSize)}`)
                console.log('')
            })
        }

    } catch (error) {
        console.error('❌ Error listing buckets:', error.message)
        console.error('Stack:', error.stack)
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Run the script
listStorageBuckets()