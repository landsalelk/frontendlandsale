#!/usr/bin/env node

/**
 * Appwrite Storage Setup Script - API Direct Approach
 * This script creates storage buckets using the Appwrite API directly
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const https = require('https')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

// Parse endpoint to get host and path
const endpointUrl = new URL(APPWRITE_ENDPOINT)
const HOST = endpointUrl.host
const BASE_PATH = endpointUrl.pathname.replace(/\/$/, '') // Remove trailing slash

async function createBucketWithAPI(bucketConfig) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            bucketId: bucketConfig.bucketId,
            name: bucketConfig.name,
            description: bucketConfig.description,
            permissions: [
                'read("any")',
                'create("users")',
                'update("users")',
                'delete("users")'
            ],
            fileSecurity: true,
            allowedFileExtensions: bucketConfig.extensions,
            maximumFileSize: bucketConfig.maxSize,
            encryption: true,
            antivirus: true
        })

        const options = {
            hostname: HOST,
            port: 443,
            path: `${BASE_PATH}/storage/buckets`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                'X-Appwrite-Key': APPWRITE_API_KEY
            }
        }

        const req = https.request(options, (res) => {
            let responseData = ''

            res.on('data', (chunk) => {
                responseData += chunk
            })

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData)
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response)
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${response.message || responseData}`))
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${responseData}`))
                }
            })
        })

        req.on('error', (error) => {
            reject(error)
        })

        req.write(data)
        req.end()
    })
}

async function listBucketsWithAPI() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: 443,
            path: `${BASE_PATH}/storage/buckets`,
            method: 'GET',
            headers: {
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                'X-Appwrite-Key': APPWRITE_API_KEY
            }
        }

        const req = https.request(options, (res) => {
            let responseData = ''

            res.on('data', (chunk) => {
                responseData += chunk
            })

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData)
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response)
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${response.message || responseData}`))
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${responseData}`))
                }
            })
        })

        req.on('error', (error) => {
            reject(error)
        })

        req.end()
    })
}

async function setupStorageAPI() {
    console.log('🚀 Starting Appwrite Storage Setup via API...')
    
    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables')
        return
    }

    try {
        console.log('📡 Connecting to Appwrite API...')
        console.log('📍 Endpoint:', APPWRITE_ENDPOINT)
        console.log('📍 Project:', APPWRITE_PROJECT_ID)

        // Check existing buckets
        console.log('\n🔍 Checking existing buckets...')
        const existingBuckets = await listBucketsWithAPI()
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

        // Create buckets
        console.log('\n➕ Creating buckets...')
        for (const config of bucketConfigs) {
            try {
                if (existingBucketIds.includes(config.bucketId)) {
                    console.log(`⚠️  Bucket already exists: ${config.name} (${config.bucketId})`)
                } else {
                    console.log(`➕ Creating: ${config.name} (${config.bucketId})`)
                    await createBucketWithAPI(config)
                    console.log(`✅ Created: ${config.name}`)
                }
            } catch (error) {
                console.error(`❌ Error creating ${config.name}:`, error.message)
            }
        }

        // Final verification
        console.log('\n🔍 Final bucket verification...')
        const finalBuckets = await listBucketsWithAPI()
        
        console.log('\n📊 Storage Buckets Summary:')
        if (finalBuckets.buckets.length === 0) {
            console.log('  ❌ No buckets found')
        } else {
            finalBuckets.buckets.forEach(bucket => {
                console.log(`  ✅ ${bucket.name} (${bucket.$id})`)
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
        }

    } catch (error) {
        console.error('❌ Error during storage setup:', error.message)
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
setupStorageAPI()