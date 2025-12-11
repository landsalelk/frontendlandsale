// Test script to check what we can access with current API key permissions
const { Client, Databases, Storage, Account } = require('node-appwrite')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)

async function testAvailablePermissions() {
    console.log('🔍 Testing Available Permissions...')
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    console.log('')

    const results = {
        database: { status: 'unknown', error: null },
        storage: { status: 'unknown', error: null },
        account: { status: 'unknown', error: null }
    }

    // Test 1: Try to list databases (admin permission)
    try {
        console.log('📦 Test 1: Listing databases...')
        await databases.list()
        results.database.status = 'full_access'
        console.log('✅ Full database access available')
    } catch (error) {
        results.database.error = error.message
        if (error.code === 401) {
            console.log('⚠️  No admin database access (this is normal for scoped API keys)')
            results.database.status = 'limited'
        } else {
            console.log('❌ Database error:', error.message)
        }
    }

    // Test 2: Try to access a specific database (if it exists)
    try {
        console.log('\n📋 Test 2: Accessing specific database...')
        await databases.get(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
        results.database.status = 'database_access'
        console.log('✅ Can access specific database')
    } catch (error) {
        if (error.code === 404) {
            console.log('⚠️  Database does not exist yet')
            results.database.status = 'no_database'
        } else if (error.code === 401) {
            console.log('⚠️  No permission to access this database')
            results.database.status = 'no_permission'
        } else {
            console.log('❌ Database access error:', error.message)
        }
    }

    // Test 3: Try to list storage buckets
    try {
        console.log('\n📸 Test 3: Listing storage buckets...')
        await storage.listBuckets()
        results.storage.status = 'full_access'
        console.log('✅ Full storage access available')
    } catch (error) {
        results.storage.error = error.message
        if (error.code === 401) {
            console.log('⚠️  No storage admin access')
            results.storage.status = 'limited'
        } else {
            console.log('❌ Storage error:', error.message)
        }
    }

    // Test 4: Try to list users (if account service is available)
    try {
        console.log('\n👥 Test 4: Testing user management...')
        const { Users } = require('node-appwrite')
        const users = new Users(client)
        await users.list()
        results.account.status = 'user_management'
        console.log('✅ User management access available')
    } catch (error) {
        results.account.error = error.message
        if (error.code === 401) {
            console.log('⚠️  No user management access')
            results.account.status = 'limited'
        } else {
            console.log('❌ User management error:', error.message)
        }
    }

    // Summary
    console.log('\n📊 PERMISSIONS SUMMARY:')
    console.log('═══════════════════════════════════════')
    console.log('Database Access:', results.database.status)
    console.log('Storage Access:', results.storage.status)
    console.log('Account Access:', results.account.status)
    console.log('')

    // Recommendations
    console.log('💡 RECOMMENDATIONS:')
    if (results.database.status === 'limited' || results.database.status === 'no_permission') {
        console.log('   • Your API key has limited permissions (this is secure!)')
        console.log('   • You may need to create the database manually in Appwrite Console')
        console.log('   • Or request an API key with database:create permission from your admin')
    }
    
    if (results.database.status === 'no_database') {
        console.log('   • The database does not exist yet')
        console.log('   • Create it manually in Appwrite Console first')
    }
    
    console.log('   • Test with existing collections if database exists')
    console.log('   • Check Appwrite Console for available resources')
}

testAvailablePermissions()