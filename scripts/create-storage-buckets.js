#!/usr/bin/env node

/**
 * Appwrite Storage Create Script
 * This script creates storage buckets using the correct API
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { Client, Storage } = require('node-appwrite')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

async function createStorageBuckets() {
    console.log('🚀 Creating Appwrite Storage Buckets...')
    
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

        // Bucket configurations
        const buckets = [
            {
                bucketId: 'listing_images',
                name: 'Listing Images',
                description: 'Property listing images and photos'
            },
            {
                bucketId: 'user_avatars',
                name: 'User Avatars',
                description: 'User profile avatar images'
            },
            {
                bucketId: 'listing_documents',
                name: 'Listing Documents',
                description: 'Property documents and certificates'
            },
            {
                bucketId: 'blog_images',
                name: 'Blog Images',
                description: 'Blog post images and media'
            }
        ]

        // Create each bucket
        for (const bucket of buckets) {
            try {
                console.log(`➕ Creating bucket: ${bucket.name} (${bucket.bucketId})`)
                
                await storage.createBucket(
                    bucket.bucketId,
                    bucket.name,
                    bucket.description
                )
                
                console.log(`✅ Created bucket: ${bucket.name}`)
                
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Bucket ${bucket.name} already exists`)
                } else {
                    console.error(`❌ Error creating bucket ${bucket.name}:`, error.message)
                }
            }
        }

        // List all buckets to verify
        console.log('\n🔍 Verifying created buckets...')
        const allBuckets = await storage.listBuckets()
        
        console.log('\n📊 Storage Buckets:')
        allBuckets.buckets.forEach(bucket => {
            console.log(`  📁 ${bucket.name} (${bucket.$id})`)
            console.log(`     Files: ${bucket.files}`)
            console.log(`     Size: ${formatFileSize(bucket.size)}`)
            console.log('')
        })

        console.log('🎉 Appwrite Storage setup completed!')

    } catch (error) {
        console.error('❌ Error during storage setup:', error.message)
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
createStorageBuckets()