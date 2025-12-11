// Script to verify Appwrite setup after manual database creation
const { Client, Databases, Storage } = require('node-appwrite')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)

async function verifySetup() {
    console.log('🔍 Verifying Appwrite Setup...')
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    console.log('Project:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    console.log('Database:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
    console.log('')

    const results = {
        database: false,
        collections: [],
        buckets: [],
        errors: []
    }

    try {
        // Test database access
        console.log('📦 Testing database access...')
        const database = await databases.get(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
        results.database = true
        console.log('✅ Database found:', database.name, `(ID: ${database.$id})`)
        
        // Test collections
        console.log('\n📋 Testing collections...')
        const collections = [
            'listings',
            'favorites', 
            'regions',
            'cities',
            'users_extended',
            'categories',
            'countries',
            'areas'
        ]
        
        for (const collectionId of collections) {
            try {
                const collection = await databases.getCollection(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, 
                    collectionId
                )
                results.collections.push({
                    id: collectionId,
                    name: collection.name,
                    status: 'exists'
                })
                console.log(`✅ Collection "${collection.name}" (${collectionId}) exists`)
                
                // Count documents
                try {
                    const docs = await databases.listDocuments(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                        collectionId
                    )
                    console.log(`   - Documents: ${docs.total}`)
                } catch (e) {
                    console.log(`   - Documents: Unable to count (permission issue)`)
                }
                
            } catch (error) {
                if (error.code === 404) {
                    results.collections.push({
                        id: collectionId,
                        status: 'missing'
                    })
                    console.log(`❌ Collection "${collectionId}" not found`)
                } else {
                    results.collections.push({
                        id: collectionId,
                        status: 'error',
                        error: error.message
                    })
                    console.log(`⚠️  Collection "${collectionId}" error:`, error.message)
                }
            }
        }
        
        // Test storage buckets
        console.log('\n📸 Testing storage buckets...')
        const bucketIds = [
            'listing_images',
            'user_avatars',
            'listing_documents',
            'blog_images'
        ]
        
        for (const bucketId of bucketIds) {
            try {
                const bucket = await storage.getBucket(bucketId)
                results.buckets.push({
                    id: bucketId,
                    name: bucket.name,
                    status: 'exists'
                })
                console.log(`✅ Bucket "${bucket.name}" (${bucketId}) exists`)
            } catch (error) {
                if (error.code === 404) {
                    results.buckets.push({
                        id: bucketId,
                        status: 'missing'
                    })
                    console.log(`❌ Bucket "${bucketId}" not found`)
                } else {
                    results.buckets.push({
                        id: bucketId,
                        status: 'error',
                        error: error.message
                    })
                    console.log(`⚠️  Bucket "${bucketId}" error:`, error.message)
                }
            }
        }
        
    } catch (error) {
        results.errors.push(error.message)
        console.error('❌ Setup verification failed:', error.message)
    }

    // Summary
    console.log('\n📊 SETUP VERIFICATION SUMMARY:')
    console.log('═══════════════════════════════════════')
    console.log('Database:', results.database ? '✅ Connected' : '❌ Not found')
    console.log('Collections:', results.collections.filter(c => c.status === 'exists').length, 'existing')
    console.log('Missing Collections:', results.collections.filter(c => c.status === 'missing').length)
    console.log('Buckets:', results.buckets.filter(b => b.status === 'exists').length, 'existing')
    console.log('Missing Buckets:', results.buckets.filter(b => b.status === 'missing').length)
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:')
        results.errors.forEach(error => console.log('  -', error))
    }
    
    // Recommendations
    console.log('\n💡 NEXT STEPS:')
    if (!results.database) {
        console.log('   1. Create the database manually in Appwrite Console')
        console.log('   2. Use Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
    }
    
    const missingCollections = results.collections.filter(c => c.status === 'missing')
    if (missingCollections.length > 0) {
        console.log('   3. Create missing collections:')
        missingCollections.forEach(col => console.log(`      - ${col.id}`))
    }
    
    const missingBuckets = results.buckets.filter(b => b.status === 'missing')
    if (missingBuckets.length > 0) {
        console.log('   4. Create missing storage buckets:')
        missingBuckets.forEach(bucket => console.log(`      - ${bucket.id}`))
    }
    
    if (results.database && missingCollections.length === 0) {
        console.log('   ✅ Setup is complete! Test your application at:')
        console.log('   http://localhost:3000/test-appwrite')
    }
    
    return results
}

verifySetup()