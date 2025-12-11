// Test Appwrite connection with proper API key
const { Client, Databases } = require('node-appwrite');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testAppwriteConnection() {
    console.log('Testing Appwrite connection with API key...');
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    console.log('API Key present:', !!process.env.APPWRITE_API_KEY);
    
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        
        console.log('✓ Client created successfully');
        
        // Test listing databases (requires databases.read scope)
        console.log('Testing database list...');
        const databasesList = await databases.list();
        console.log('✅ Successfully connected to Appwrite!');
        console.log('Databases found:', databasesList.total);
        
        if (databasesList.databases.length > 0) {
            console.log('Available databases:');
            databasesList.databases.forEach(db => {
                console.log(`  - ${db.name} (${db.$id})`);
            });
        }
        
        // Test specific database access
        console.log('\nTesting specific database access...');
        try {
            const db = await databases.get(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
            console.log(`✅ Database "${db.name}" (${db.$id}) is accessible`);
        } catch (dbError) {
            console.log('⚠️  Could not access specific database:', dbError.message);
        }
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.type) {
            console.error('Error type:', error.type);
        }
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

testAppwriteConnection();