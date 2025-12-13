// Create a real property listing via the database
// Run with: node create-test-listing.mjs

import { Client, Databases, ID } from 'appwrite';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'osclass_landsale_db';
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LISTINGS_COLLECTION_ID || 'listings';

console.log('🔧 Configuration:');
console.log('   Endpoint:', APPWRITE_ENDPOINT);
console.log('   Project ID:', APPWRITE_PROJECT_ID);
console.log('   Database ID:', DATABASE_ID);
console.log('   Collection ID:', COLLECTION_ID);
console.log('');

async function createListing() {
    console.log('🏡 Creating a real property listing...\n');

    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
        console.error('❌ Missing Appwrite configuration');
        return null;
    }

    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID);

    const databases = new Databases(client);

    const listingData = {
        title: '25 Perch Land for Sale in Nugegoda, Colombo',
        description: 'Beautiful 25 perch flat land for sale in prime Nugegoda area. Features road access and electricity connection. Excellent residential location near schools and shops. Clear title, immediate transfer. Asking price: Rs. 8,000,000. Contact: 0771234567',
        price: 8000000,
        type: 'land',
        status: 'active',
        city: 'Nugegoda',
        district: 'Colombo',
        land_size: 25,
        land_unit: 'perches',
        user_id: 'ai-chat-demo',
        views: 0,
        is_featured: false,
    };

    try {
        const documentId = ID.unique();

        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            documentId,
            listingData
        );

        console.log('✅ Listing created successfully!\n');
        console.log('📋 Listing Details:');
        console.log('   ID:', result.$id);
        console.log('   Title:', result.title);
        console.log('   Price: Rs.', result.price?.toLocaleString());
        console.log('   Location:', result.city + ', ' + result.district);
        console.log('');
        console.log('🔗 VIEW YOUR LISTING HERE:');
        console.log(`   http://localhost:3000/properties/${result.$id}`);
        console.log('');

        return result.$id;

    } catch (error) {
        console.error('❌ Error creating listing:', error.message);
        console.error('   Code:', error.code);
        console.error('   Type:', error.type);

        return null;
    }
}

createListing();
