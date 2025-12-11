// Simple test script to verify Appwrite connection
const { Client, Databases } = require('node-appwrite')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

async function testConnection() {
    console.log('🔍 Testing Appwrite Connection...')
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    console.log('Database:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
    console.log('')

    try {
        // Test 1: Try to list databases (requires admin permissions)
        console.log('📦 Test 1: Listing databases...')
        const dbList = await databases.list()
        console.log('✅ Database list retrieved:', dbList.total, 'databases')
        
        // Test 2: Try to get specific database
        console.log('\n📋 Test 2: Getting database details...')
        const database = await databases.get(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
        console.log('✅ Database found:', database.name, `(ID: ${database.$id})`)
        
        // Test 3: Try to list collections
        console.log('\n📁 Test 3: Listing collections...')
        const collections = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
        console.log('✅ Collections found:', collections.total)
        
        collections.collections.forEach(coll => {
            console.log(`   - ${coll.name} (${coll.$id})`)
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('Code:', error.code)
        console.error('Type:', error.type)
        
        if (error.code === 401) {
            console.log('\n💡 This error usually means:')
            console.log('   - API key lacks required permissions')
            console.log('   - Project ID is incorrect')
            console.log('   - API endpoint is wrong')
        }
        
        if (error.code === 404) {
            console.log('\n💡 This error usually means:')
            console.log('   - Database does not exist')
            console.log('   - Project ID is incorrect')
            console.log('   - Resource not found')
        }
    }
}

testConnection()