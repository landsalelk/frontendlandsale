import { createAdminClient, DATABASE_ID, COLLECTIONS } from "../src/lib/appwrite/server.js";
import { Query } from "node-appwrite";

async function debugListingData() {
    try {
        const { databases } = await createAdminClient();
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('status', 'active'),
                Query.orderDesc('$createdAt'),
                Query.limit(5)
            ]
        );

        console.log('📊 Found', response.documents.length, 'listings');
        
        response.documents.forEach((listing, index) => {
            console.log(`\n📝 Listing ${index + 1} (ID: ${listing.$id})`);
            console.log('Raw title:', JSON.stringify(listing.title));
            console.log('Raw location:', JSON.stringify(listing.location));
            console.log('Raw attributes:', JSON.stringify(listing.attributes));
            
            // Try to parse each field
            try {
                if (listing.title) {
                    const parsedTitle = JSON.parse(listing.title);
                    console.log('Parsed title:', parsedTitle);
                }
            } catch (e) {
                console.log('❌ Title parsing error:', e.message);
            }
            
            try {
                if (listing.location) {
                    const parsedLocation = JSON.parse(listing.location);
                    console.log('Parsed location:', parsedLocation);
                }
            } catch (e) {
                console.log('❌ Location parsing error:', e.message);
            }
            
            try {
                if (listing.attributes) {
                    const parsedAttributes = JSON.parse(listing.attributes);
                    console.log('Parsed attributes:', parsedAttributes);
                }
            } catch (e) {
                console.log('❌ Attributes parsing error:', e.message);
            }
        });

    } catch (error) {
        console.error('Error fetching listings:', error);
    }
}

debugListingData();