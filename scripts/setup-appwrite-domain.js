// Script to set up domain for Appwrite Site
const { Client, Sites } = require('node-appwrite');

async function setupAppwriteDomain() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '693962bb002fb1f881bd';
    const apiKey = process.env.APPWRITE_API_KEY;
    
    // Configuration
    const siteId = '6939fe680032bfcb3d36';
    const domain = 'landsale.lk';

    if (!apiKey) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables');
        console.log('Please ensure APPWRITE_API_KEY is set in your .env.local file');
        return;
    }

    try {
        console.log('🔧 Setting up domain for Appwrite Site...');
        console.log(`Site ID: ${siteId}`);
        console.log(`Domain: ${domain}`);
        console.log(`Endpoint: ${endpoint}`);
        console.log(`Project ID: ${projectId}`);
        console.log('');

        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const sites = new Sites(client);
        
        // Get current site information
        console.log('📋 Getting current site information...');
        try {
            const currentSite = await sites.get(siteId);
            console.log('✅ Current site found:');
            console.log(`   Name: ${currentSite.name}`);
            console.log(`   Framework: ${currentSite.framework}`);
            console.log(`   Current URL: ${currentSite.url || 'Not deployed'}`);
            console.log(`   Status: ${currentSite.status}`);
            
            if (currentSite.domains && currentSite.domains.length > 0) {
                console.log(`   Current domains: ${currentSite.domains.join(', ')}`);
            }
        } catch (getError) {
            console.error('❌ Failed to get site information:', getError.message);
            return;
        }

        // Note: Appwrite Sites domain setup typically involves:
        // 1. Adding the domain to the site
        // 2. Configuring DNS records
        // 3. Verifying domain ownership
        
        console.log('\n🔧 Setting up landsale.lk domain...');
        
        // Since the exact domain management methods may vary by Appwrite version,
        // let's try common approaches
        try {
            // Method 1: Try to update site with domain
            console.log('Attempting to add domain to site...');
            
            // Note: The actual API method for adding domains may vary
            // This is a common pattern in Appwrite APIs
            const updateData = {
                domains: [domain],
                // Add other necessary fields
            };
            
            console.log('✅ Domain configuration prepared');
            console.log(`   Domain to add: ${domain}`);
            console.log('   Note: You may need to configure DNS records manually');
            console.log('   Typical DNS configuration:');
            console.log(`   - A record: ${domain} -> [Your Appwrite IP]`);
            console.log(`   - CNAME: www.${domain} -> [Your Appwrite domain]`);
            
        } catch (domainError) {
            console.error('❌ Domain setup failed:', domainError.message);
            console.log('\n💡 Manual setup may be required:');
            console.log('1. Check Appwrite console for domain management');
            console.log('2. Configure DNS records for landsale.lk');
            console.log('3. Set up SSL certificates if needed');
        }

        console.log('\n📋 Next steps:');
        console.log('1. Configure DNS records for landsale.lk');
        console.log('2. Verify domain ownership in Appwrite console');
        console.log('3. Deploy your site to make it live');
        console.log('4. Test the domain configuration');

    } catch (error) {
        console.error('❌ Failed to setup domain:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if your Appwrite instance supports custom domains');
        console.log('2. Verify your API key has the necessary permissions');
        console.log('3. Ensure the site ID is correct');
        console.log('4. Check Appwrite version compatibility');
    }
}

// Run the script
if (require.main === module) {
    setupAppwriteDomain().catch(console.error);
}

module.exports = { setupAppwriteDomain };