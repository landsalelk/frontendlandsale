// Debug script to check listing data format
// This script uses the existing appwrite configuration from your app

async function debugListingData() {
    try {
        // Import the server client configuration
        const { createAdminClient, DATABASE_ID, COLLECTIONS } = await import('../src/lib/appwrite/server.ts');
        
        const { databases } = await createAdminClient();
        const { Query } = await import('node-appwrite');
        
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
                    console.log('✅ Parsed title:', parsedTitle);
                }
            } catch (e) {
                console.log('❌ Title parsing error:', e.message);
                console.log('Title content preview:', listing.title?.substring(0, 50));
            }
            
            try {
                if (listing.location) {
                    const parsedLocation = JSON.parse(listing.location);
                    console.log('✅ Parsed location:', parsedLocation);
                }
            } catch (e) {
                console.log('❌ Location parsing error:', e.message);
                console.log('Location content preview:', listing.location?.substring(0, 50));
            }
            
            try {
                if (listing.attributes) {
                    const parsedAttributes = JSON.parse(listing.attributes);
                    console.log('✅ Parsed attributes:', parsedAttributes);
                }
            } catch (e) {
                console.log('❌ Attributes parsing error:', e.message);
                console.log('Attributes content preview:', listing.attributes?.substring(0, 50));
            }
        });

    } catch (error) {
        console.error('Error fetching listings:', error);
    }
}

debugListingData();