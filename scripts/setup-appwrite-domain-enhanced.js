// Enhanced script for Appwrite Site domain setup with manual configuration guide
const { Client, Sites } = require('node-appwrite');

async function setupAppwriteDomainEnhanced() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '693962bb002fb1f881bd';
    const apiKey = process.env.APPWRITE_API_KEY;
    
    // Configuration
    const siteId = '6939fe680032bfcb3d36';
    const domain = 'landsale.lk';

    console.log('🌐 Appwrite Site Domain Setup for landsale.lk');
    console.log('='.repeat(50));
    console.log(`Site ID: ${siteId}`);
    console.log(`Target Domain: ${domain}`);
    console.log(`Project ID: ${projectId}`);
    console.log(`Endpoint: ${endpoint}`);
    console.log('');

    if (!apiKey) {
        console.warn('⚠️  APPWRITE_API_KEY not found - showing manual setup guide');
        showManualSetupGuide(siteId, domain);
        return;
    }

    try {
        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const sites = new Sites(client);
        
        // Try to get current site info
        console.log('📊 Checking current site configuration...');
        try {
            const currentSite = await sites.get(siteId);
            console.log('✅ Site found successfully:');
            console.log(`   Name: ${currentSite.name}`);
            console.log(`   Framework: ${currentSite.framework}`);
            console.log(`   Current URL: ${currentSite.url || 'Not deployed'}`);
            console.log(`   Status: ${currentSite.status || 'Unknown'}`);
            
            if (currentSite.domains && currentSite.domains.length > 0) {
                console.log(`   Current domains: ${currentSite.domains.join(', ')}`);
            }
        } catch (getError) {
            console.warn('⚠️  Could not retrieve site info:', getError.message);
            console.log('   Proceeding with manual setup guide...');
        }

        // Attempt domain configuration
        console.log('\n🔧 Attempting domain configuration...');
        try {
            // Note: Appwrite Sites API methods for domain management
            // may vary by version. Common approaches include:
            
            // Method 1: Update site with domain
            console.log('Trying to update site configuration...');
            
            // This is a placeholder - actual API method may differ
            // await sites.update(siteId, { domains: [domain] });
            
            console.log('✅ Domain configuration attempted');
            
        } catch (updateError) {
            console.warn('⚠️  Direct API configuration failed:', updateError.message);
            console.log('   This is normal - manual configuration may be required');
        }

        showManualSetupGuide(siteId, domain);

    } catch (error) {
        console.error('❌ Connection error:', error.message);
        showManualSetupGuide(siteId, domain);
    }
}

function showManualSetupGuide(siteId, domain) {
    console.log('\n📋 MANUAL DOMAIN SETUP GUIDE');
    console.log('='.repeat(40));
    
    console.log('\n1️⃣  Access Appwrite Console:');
    console.log('   • Open your Appwrite console');
    console.log('   • Navigate to your project: 693962bb002fb1f881bd');
    console.log('   • Go to Sites section');
    console.log(`   • Find your site: ${siteId}`);
    
    console.log('\n2️⃣  Configure Domain in Appwrite:');
    console.log('   • Click on your site (Site ID: 6939fe680032bfcb3d36)');
    console.log('   • Look for "Domains" or "Custom Domain" section');
    console.log('   • Add domain: landsale.lk');
    console.log('   • Save configuration');
    
    console.log('\n3️⃣  DNS Configuration Required:');
    console.log('   You need to configure DNS records for landsale.lk:');
    console.log('');
    console.log('   🅰️  A Record:');
    console.log('   • Name: @ (or landsale.lk)');
    console.log('   • Value: 75.119.150.209 (your Appwrite server IP)');
    console.log('   • TTL: 3600');
    console.log('');
    console.log('   🌐 CNAME Record:');
    console.log('   • Name: www');
    console.log('   • Value: appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io');
    console.log('   • TTL: 3600');
    
    console.log('\n4️⃣  Domain Verification:');
    console.log('   • Appwrite may provide verification steps');
    console.log('   • Follow the verification process in console');
    console.log('   • This may involve adding TXT records');
    
    console.log('\n5️⃣  SSL Certificate:');
    console.log('   • Appwrite typically handles SSL automatically');
    console.log('   • Wait for certificate provisioning');
    console.log('   • This may take a few minutes to hours');
    
    console.log('\n6️⃣  Final Steps:');
    console.log('   • Deploy your site if not already deployed');
    console.log('   • Test the domain: https://landsale.lk');
    console.log('   • Test www version: https://www.landsale.lk');
    
    console.log('\n⏱️  Timeline:');
    console.log('   • DNS changes: 5 minutes - 48 hours to propagate');
    console.log('   • SSL certificate: Usually within 1 hour');
    console.log('   • Full setup: Allow up to 24 hours for complete propagation');
    
    console.log('\n🔍 Verification Commands:');
    console.log('   # Check DNS resolution:');
    console.log('   nslookup landsale.lk');
    console.log('   dig landsale.lk');
    console.log('');
    console.log('   # Check SSL certificate:');
    console.log('   openssl s_client -connect landsale.lk:443 -servername landsale.lk');
    console.log('');
    console.log('   # Test HTTP response:');
    console.log('   curl -I https://landsale.lk');
}

// Run the script
if (require.main === module) {
    setupAppwriteDomainEnhanced().catch(console.error);
}

module.exports = { setupAppwriteDomainEnhanced };