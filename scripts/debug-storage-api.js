#!/usr/bin/env node

/**
 * Appwrite Storage Debug Script
 * This script helps debug the storage API
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { Client, Storage } = require('node-appwrite')

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY

async function debugStorageAPI() {
    console.log('🔍 Debugging Appwrite Storage API...')
    
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

        // Try to create a bucket with minimal parameters
        console.log('\n🧪 Testing createBucket with minimal parameters...')
        try {
            await storage.createBucket(
                'test-bucket',
                'Test Bucket',
                'Test description'
            )
            console.log('✅ Minimal createBucket succeeded')
        } catch (error) {
            console.error('❌ Minimal createBucket failed:', error.message)
            console.log('Error details:', error)
        }

        // Try to create a bucket with all parameters
        console.log('\n🧪 Testing createBucket with all parameters...')
        try {
            await storage.createBucket(
                'test-bucket-full',
                'Test Bucket Full',
                'Test description',
                [], // permissions
                true, // fileSecurity
                ['jpg', 'png'], // allowedFileExtensions
                5 * 1024 * 1024, // maximumFileSize
                true, // encryption
                true  // antivirus
            )
            console.log('✅ Full createBucket succeeded')
        } catch (error) {
            console.error('❌ Full createBucket failed:', error.message)
            console.log('Error details:', error)
        }

        // List buckets to see what we have
        console.log('\n📋 Current buckets:')
        const buckets = await storage.listBuckets()
        buckets.buckets.forEach(bucket => {
            console.log(`  📁 ${bucket.name} (${bucket.$id})`)
        })

    } catch (error) {
        console.error('❌ Error during debug:', error.message)
        console.error('Stack:', error.stack)
    }
}

// Run the debug script
debugStorageAPI()