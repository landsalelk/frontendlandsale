// Simple test to verify Appwrite SDK connection
const { Client, Databases } = require('node-appwrite');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('Testing Appwrite connection...');
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);
        
        console.log('✓ Client created successfully');
        
        // Test listing collections
        const collections = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
        console.log('✓ Connected to database successfully');
        console.log('Collections found:', collections.collections.length);
        
        collections.collections.forEach(collection => {
            console.log(`  - ${collection.name} (${collection.$id})`);
        });
        
        console.log('\n🎉 Appwrite SDK is configured correctly!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.type) {
            console.error('Error type:', error.type);
        }
    }
}

testConnection();