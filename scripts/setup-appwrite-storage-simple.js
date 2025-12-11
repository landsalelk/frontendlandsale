#!/usr/bin/env node

/**
 * Appwrite Storage Setup Script - Simplified Version
 * This script creates and configures storage buckets for the real estate application
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { Client, Storage, ID } = require('node-appwrite')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

// Storage bucket configurations
const BUCKET_CONFIGS = [
    {
        bucketId: 'listing_images',
        name: 'Listing Images',
        description: 'Property listing images and photos',
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        maximumFileSize: 10 * 1024 * 1024, // 10MB
        permissions: null // Use default permissions
    },
    {
        bucketId: 'user_avatars',
        name: 'User Avatars',
        description: 'User profile avatar images',
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        maximumFileSize: 5 * 1024 * 1024, // 5MB
        permissions: null // Use default permissions
    },
    {
        bucketId: 'listing_documents',
        name: 'Listing Documents',
        description: 'Property documents and certificates',
        allowedFileExtensions: ['pdf', 'doc', 'docx', 'txt'],
        maximumFileSize: 20 * 1024 * 1024, // 20MB
        permissions: null // Use default permissions
    },
    {
        bucketId: 'blog_images',
        name: 'Blog Images',
        description: 'Blog post images and media',
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        maximumFileSize: 10 * 1024 * 1024, // 10MB
        permissions: null // Use default permissions
    }
]

async function setupAppwriteStorage() {
    console.log('🚀 Starting Appwrite Storage Setup...')
    
    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables')
        console.log('💡 Please ensure your .env.local file contains:')
        console.log('   APPWRITE_API_KEY=your_api_key_here')
        process.exit(1)
    }

    try {
        // Initialize Appwrite client
        const client = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)
            .setKey(APPWRITE_API_KEY)

        const storage = new Storage(client)

        console.log('📡 Connected to Appwrite project:', APPWRITE_PROJECT_ID)

        // Check existing buckets
        console.log('🔍 Checking existing buckets...')
        const existingBuckets = await storage.listBuckets()
        const existingBucketIds = existingBuckets.buckets.map(bucket => bucket.$id)
        
        console.log('📋 Found existing buckets:', existingBucketIds)

        // Create or update buckets
        for (const config of BUCKET_CONFIGS) {
            try {
                if (existingBucketIds.includes(config.bucketId)) {
                    console.log(`🔄 Updating existing bucket: ${config.name} (${config.bucketId})`)
                    
                    await storage.updateBucket(
                        config.bucketId,
                        config.name,
                        config.description,
                        config.permissions, // Use null for default permissions
                        true, // fileSecurity
                        config.allowedFileExtensions,
                        config.maximumFileSize,
                        true, // encryption
                        true  // antivirus
                    )
                    
                    console.log(`✅ Updated bucket: ${config.name}`)
                } else {
                    console.log(`➕ Creating new bucket: ${config.name} (${config.bucketId})`)
                    
                    await storage.createBucket(
                        config.bucketId,
                        config.name,
                        config.description,
                        config.permissions, // Use null for default permissions
                        true, // fileSecurity
                        config.allowedFileExtensions,
                        config.maximumFileSize,
                        true, // encryption
                        true  // antivirus
                    )
                    
                    console.log(`✅ Created bucket: ${config.name}`)
                }
            } catch (error) {
                console.error(`❌ Error setting up bucket ${config.name}:`, error.message)
            }
        }

        // Verify all buckets
        console.log('\n🔍 Verifying all buckets...')
        const finalBuckets = await storage.listBuckets()
        
        console.log('\n📊 Storage Buckets Summary:')
        finalBuckets.buckets.forEach(bucket => {
            console.log(`  📁 ${bucket.name} (${bucket.$id})`)
            console.log(`     Files: ${bucket.files}`)
            console.log(`     Size: ${formatFileSize(bucket.size)}`)
            console.log(`     Extensions: ${bucket.allowedFileExtensions?.join(', ') || 'All'}`)
            console.log(`     Max Size: ${formatFileSize(bucket.maximumFileSize)}`)
            console.log('')
        })

        console.log('🎉 Appwrite Storage setup completed successfully!')
        console.log('\n📋 Next steps:')
        console.log('   1. Test file uploads in your application')
        console.log('   2. Verify bucket permissions work correctly')
        console.log('   3. Check that your sync functions work with the new buckets')

    } catch (error) {
        console.error('❌ Error during storage setup:', error.message)
        console.error('Stack:', error.stack)
        process.exit(1)
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Run the setup
if (require.main === module) {
    setupAppwriteStorage().catch(console.error)
}