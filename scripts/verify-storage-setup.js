#!/usr/bin/env node

/**
 * Appwrite Storage Verification Script
 * This script verifies the current storage configuration and provides manual setup instructions
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { Client, Storage } = require('node-appwrite')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

async function verifyStorageSetup() {
    console.log('🔍 Verifying Appwrite Storage Setup...')
    
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

        // List existing buckets
        console.log('\n📋 Current Storage Buckets:')
        const buckets = await storage.listBuckets()
        
        if (buckets.buckets.length === 0) {
            console.log('  ❌ No buckets found - Manual setup required')
        } else {
            buckets.buckets.forEach(bucket => {
                console.log(`  ✅ ${bucket.name} (${bucket.$id})`)
                console.log(`     Files: ${bucket.files}`)
                console.log(`     Size: ${formatFileSize(bucket.size)}`)
                console.log(`     Extensions: ${bucket.allowedFileExtensions?.join(', ') || 'All'}`)
                console.log(`     Max Size: ${formatFileSize(bucket.maximumFileSize)}`)
                console.log('')
            })
        }

        // Expected buckets based on configuration
        const expectedBuckets = [
            'listing_images',
            'user_avatars', 
            'listing_documents',
            'blog_images'
        ]

        console.log('\n📊 Expected Buckets (from .env.local):')
        expectedBuckets.forEach(bucketId => {
            const exists = buckets.buckets.some(bucket => bucket.$id === bucketId)
            console.log(`  ${exists ? '✅' : '❌'} ${bucketId}`)
        })

        if (buckets.buckets.length === 0) {
            console.log('\n🔧 Manual Setup Instructions:')
            console.log('1. Open Appwrite Console: https://cloud.appwrite.io/console')
            console.log('2. Navigate to your project: landsalelkproject')
            console.log('3. Go to Storage section')
            console.log('4. Create the following buckets:')
            
            const bucketConfigs = [
                {
                    id: 'listing_images',
                    name: 'Listing Images',
                    description: 'Property listing images and photos',
                    extensions: 'jpg, jpeg, png, webp, gif',
                    maxSize: '10MB'
                },
                {
                    id: 'user_avatars',
                    name: 'User Avatars', 
                    description: 'User profile avatar images',
                    extensions: 'jpg, jpeg, png, webp',
                    maxSize: '5MB'
                },
                {
                    id: 'listing_documents',
                    name: 'Listing Documents',
                    description: 'Property documents and certificates',
                    extensions: 'pdf, doc, docx, txt',
                    maxSize: '20MB'
                },
                {
                    id: 'blog_images',
                    name: 'Blog Images',
                    description: 'Blog post images and media',
                    extensions: 'jpg, jpeg, png, webp, gif',
                    maxSize: '10MB'
                }
            ]

            bucketConfigs.forEach(config => {
                console.log(`\n   📁 ${config.name} (${config.id})`)
                console.log(`      • Description: ${config.description}`)
                console.log(`      • Allowed Extensions: ${config.extensions}`)
                console.log(`      • Maximum File Size: ${config.maxSize}`)
                console.log(`      • Permissions: Read (any), Create/Update/Delete (users)`)
                console.log(`      • Features: Enable file security, encryption, antivirus`)
            })

            console.log('\n5. Set permissions for each bucket:')
            console.log('   • Read: Role "any" (public read access)')
            console.log('   • Create/Update/Delete: Role "users" (authenticated users)')
            console.log('6. Enable features:')
            console.log('   • File Security: Enabled')
            console.log('   • Encryption: Enabled') 
            console.log('   • Antivirus: Enabled')
        }

        console.log('\n✅ Verification completed!')
        
        if (buckets.buckets.length === expectedBuckets.length) {
            console.log('\n🎉 All storage buckets are properly configured!')
        } else {
            console.log('\n⚠️  Some buckets are missing. Please create them manually using the instructions above.')
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.message)
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

// Run the verification
verifyStorageSetup()