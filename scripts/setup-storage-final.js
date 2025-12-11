#!/usr/bin/env node

/**
 * Appwrite Storage Setup Script - Working Version
 * This script creates and configures storage buckets for the real estate application
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { Client, Storage } = require('node-appwrite')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

async function setupStorage() {
    console.log('🚀 Starting Appwrite Storage Setup...')
    
    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables')
        console.log('💡 Please ensure your .env.local file contains:')
        console.log('   APPWRITE_API_KEY=your_api_key_here')
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

        // Check existing buckets
        console.log('\n🔍 Checking existing buckets...')
        const existingBuckets = await storage.listBuckets()
        const existingBucketIds = existingBuckets.buckets.map(bucket => bucket.$id)
        
        console.log('📋 Found existing buckets:', existingBucketIds)

        // Define bucket configurations
        const bucketConfigs = [
            {
                bucketId: 'listing_images',
                name: 'Listing Images',
                description: 'Property listing images and photos',
                extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                maxSize: 10 * 1024 * 1024 // 10MB
            },
            {
                bucketId: 'user_avatars',
                name: 'User Avatars',
                description: 'User profile avatar images',
                extensions: ['jpg', 'jpeg', 'png', 'webp'],
                maxSize: 5 * 1024 * 1024 // 5MB
            },
            {
                bucketId: 'listing_documents',
                name: 'Listing Documents',
                description: 'Property documents and certificates',
                extensions: ['pdf', 'doc', 'docx', 'txt'],
                maxSize: 20 * 1024 * 1024 // 20MB
            },
            {
                bucketId: 'blog_images',
                name: 'Blog Images',
                description: 'Blog post images and media',
                extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                maxSize: 10 * 1024 * 1024 // 10MB
            }
        ]

        // Create/update buckets
        console.log('\n➕ Creating/Updating buckets...')
        for (const config of bucketConfigs) {
            try {
                if (existingBucketIds.includes(config.bucketId)) {
                    console.log(`🔄 Updating bucket: ${config.name} (${config.bucketId})`)
                    
                    // Update existing bucket with all parameters
                    await storage.updateBucket(
                        config.bucketId,
                        config.name,
                        config.description,
                        null, // permissions (null for default)
                        true, // fileSecurity
                        config.extensions,
                        config.maxSize,
                        true, // encryption
                        true  // antivirus
                    )
                    
                    console.log(`✅ Updated: ${config.name}`)
                } else {
                    console.log(`➕ Creating bucket: ${config.name} (${config.bucketId})`)
                    
                    // Create new bucket with all parameters
                    await storage.createBucket(
                        config.bucketId,
                        config.name,
                        config.description,
                        null, // permissions (null for default)
                        true, // fileSecurity
                        config.extensions,
                        config.maxSize,
                        true, // encryption
                        true  // antivirus
                    )
                    
                    console.log(`✅ Created: ${config.name}`)
                }
            } catch (error) {
                console.error(`❌ Error with ${config.name}:`, error.message)
            }
        }

        // Final verification
        console.log('\n🔍 Final bucket verification...')
        const finalBuckets = await storage.listBuckets()
        
        console.log('\n📊 Storage Buckets Summary:')
        if (finalBuckets.buckets.length === 0) {
            console.log('  ❌ No buckets found')
        } else {
            finalBuckets.buckets.forEach(bucket => {
                console.log(`  📁 ${bucket.name} (${bucket.$id})`)
                console.log(`     Files: ${bucket.files}`)
                console.log(`     Size: ${formatFileSize(bucket.size)}`)
                console.log(`     Extensions: ${bucket.allowedFileExtensions?.join(', ') || 'All'}`)
                console.log(`     Max Size: ${formatFileSize(bucket.maximumFileSize)}`)
                console.log('')
            })
        }

        console.log('🎉 Storage setup completed!')
        
        if (finalBuckets.buckets.length > 0) {
            console.log('\n✅ All storage buckets are ready for use!')
            console.log('\n📋 Configuration Summary:')
            console.log('   • Listing Images: Property photos and images (10MB max)')
            console.log('   • User Avatars: Profile pictures (5MB max)')
            console.log('   • Listing Documents: Property documents (20MB max)')
            console.log('   • Blog Images: Blog post images (10MB max)')
            console.log('\n🔧 Features enabled:')
            console.log('   • File security enabled')
            console.log('   • Encryption enabled')
            console.log('   • Antivirus scanning enabled')
        }

    } catch (error) {
        console.error('❌ Error during storage setup:', error.message)
        if (error.stack) {
            console.error('Stack:', error.stack)
        }
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
    setupStorage().catch(console.error)
}