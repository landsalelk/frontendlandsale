#!/usr/bin/env node

/**
 * Debug Script: Check regions collection schema
 * This script verifies the regions collection attributes
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

async function getCollectionAttributes() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: 443,
            path: `${BASE_PATH}/databases/${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}/collections/regions/attributes`,
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

async function debugRegionsCollection() {
    console.log('🔍 Debugging regions collection schema...')
    
    if (!APPWRITE_API_KEY) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables')
        return
    }

    try {
        console.log('📡 Connecting to Appwrite API...')
        const attributes = await getCollectionAttributes()
        
        console.log('\n📋 Regions Collection Attributes:')
        if (attributes.attributes.length === 0) {
            console.log('  ❌ No attributes found')
        } else {
            attributes.attributes.forEach(attr => {
                console.log(`  • ${attr.key} (${attr.type}) - Required: ${attr.required}, Default: ${attr.default || 'none'}`)
            })
        }

        // Check if 'active' attribute exists
        const activeAttr = attributes.attributes.find(attr => attr.key === 'active')
        if (activeAttr) {
            console.log('\n✅ Active attribute found!')
            console.log(`   Type: ${activeAttr.type}`)
            console.log(`   Required: ${activeAttr.required}`)
            console.log(`   Default: ${activeAttr.default || 'none'}`)
        } else {
            console.log('\n❌ Active attribute NOT found!')
            console.log('   This is causing the query error in getRegions()')
            console.log('   The collection needs to be recreated with the active attribute.')
        }

    } catch (error) {
        console.error('❌ Error debugging regions collection:', error.message)
    }
}

// Run the debug script
debugRegionsCollection()