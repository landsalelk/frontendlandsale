#!/usr/bin/env node

/**
 * Appwrite Storage Setup Script
 * This script creates and configures storage buckets for the real estate application
 */

import { config } from 'dotenv'
import { Client, Storage, ID, Permission, Role } from 'node-appwrite'

// Load environment variables from .env.local
config({ path: '.env.local' })

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
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    },
    {
        bucketId: 'user_avatars',
        name: 'User Avatars',
        description: 'User profile avatar images',
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        maximumFileSize: 5 * 1024 * 1024, // 5MB
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    },
    {
        bucketId: 'listing_documents',
        name: 'Listing Documents',
        description: 'Property documents and certificates',
        allowedFileExtensions: ['pdf', 'doc', 'docx', 'txt'],
        maximumFileSize: 20 * 1024 * 1024, // 20MB
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    },
    {
        bucketId: 'blog_images',
        name: 'Blog Images',
        description: 'Blog post images and media',
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        maximumFileSize: 10 * 1024 * 1024, // 10MB
        permissions: [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    }
]

async function setupAppwriteStorage() {
    console.log('🚀 Starting Appwrite Storage Setup...')
    
    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables')
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
                    
                    await storage.updateBucket({
                        bucketId: config.bucketId,
                        name: config.name,
                        permissions: config.permissions,
                        fileSecurity: true,
                        allowedFileExtensions: config.allowedFileExtensions,
                        maximumFileSize: config.maximumFileSize,
                        encryption: true,
                        antivirus: true
                    })
                    
                    console.log(`✅ Updated bucket: ${config.name}`)
                } else {
                    console.log(`➕ Creating new bucket: ${config.name} (${config.bucketId})`)
                    
                    await storage.createBucket({
                        bucketId: config.bucketId,
                        name: config.name,
                        permissions: config.permissions,
                        fileSecurity: true,
                        allowedFileExtensions: config.allowedFileExtensions,
                        maximumFileSize: config.maximumFileSize,
                        encryption: true,
                        antivirus: true
                    })
                    
                    console.log(`✅ Created bucket: ${config.name}`)
                }
            } catch (error: any) {
                console.error(`❌ Error setting up bucket ${config.name}:`, error.message)
            }
        }

        // Verify all buckets
        console.log('\n🔍 Verifying all buckets...')
        const finalBuckets = await storage.listBuckets()
        
        console.log('\n📊 Storage Buckets Summary:')
        finalBuckets.buckets.forEach(bucket => {
            console.log(`  📁 ${bucket.name} (${bucket.$id})`)
            console.log(`     Extensions: ${bucket.allowedFileExtensions?.join(', ') || 'All'}`)
            console.log(`     Max Size: ${formatFileSize(bucket.maximumFileSize)}`)
            console.log('')
        })

        console.log('🎉 Appwrite Storage setup completed successfully!')

    } catch (error: any) {
        console.error('❌ Error during storage setup:', error.message)
        console.error('Stack:', error.stack)
        process.exit(1)
    }
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Run the setup
console.log('🚀 Starting Appwrite Storage setup...')
console.log('📍 Endpoint:', APPWRITE_ENDPOINT)
console.log('📍 Project ID:', APPWRITE_PROJECT_ID)
console.log('📍 API Key present:', !!APPWRITE_API_KEY)
setupAppwriteStorage().catch(console.error)