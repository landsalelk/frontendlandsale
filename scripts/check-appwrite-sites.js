// Script to check Appwrite Sites configuration and list existing sites
const { Client, Sites } = require('node-appwrite');

async function checkAppwriteSites() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '693962bb002fb1f881bd';
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!apiKey) {
        console.error('❌ APPWRITE_API_KEY is not set in environment variables');
        console.log('Please ensure APPWRITE_API_KEY is set in your .env.local file');
        return;
    }

    try {
        console.log('🔍 Checking Appwrite configuration...');
        console.log(`Endpoint: ${endpoint}`);
        console.log(`Project ID: ${projectId}`);
        console.log(`API Key: ${apiKey.substring(0, 10)}...`);
        console.log('');

        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        // Try to initialize Sites service
        try {
            const sites = new Sites(client);
            console.log('✅ Appwrite Sites service initialized successfully');
            
            // List existing sites
            console.log('\n📋 Listing existing sites...');
            const sitesList = await sites.list();
            
            if (sitesList.sites && sitesList.sites.length > 0) {
                console.log(`Found ${sitesList.sites.length} site(s):`);
                sitesList.sites.forEach((site, index) => {
                    console.log(`\n${index + 1}. Site: ${site.name}`);
                    console.log(`   ID: ${site.$id}`);
                    console.log(`   Framework: ${site.framework}`);
                    console.log(`   Repository: ${site.repository}`);
                    console.log(`   Branch: ${site.branch}`);
                    console.log(`   URL: ${site.url || 'Not deployed'}`);
                    console.log(`   Status: ${site.status}`);
                    console.log(`   Created: ${new Date(site.$createdAt).toLocaleString()}`);
                });
            } else {
                console.log('ℹ️  No sites found in this project');
            }

            // Check available frameworks
            console.log('\n🔧 Available frameworks:');
            const frameworks = await sites.listFrameworks();
            if (frameworks.frameworks && frameworks.frameworks.length > 0) {
                frameworks.frameworks.forEach(framework => {
                    console.log(`- ${framework.name} (${framework.language})`);
                });
            }

        } catch (sitesError) {
            console.error('❌ Sites service error:', sitesError.message);
            console.log('\n💡 This might mean:');
            console.log('1. Sites service is not enabled in your Appwrite instance');
            console.log('2. Your API key doesn\'t have sites permissions');
            console.log('3. Your Appwrite version doesn\'t support Sites');
        }

        // Check project info
        console.log('\n📊 Project Information:');
        try {
            const { databases } = require('node-appwrite');
            const db = new databases.Databases(client);
            const projectInfo = await db.list();
            console.log('Database service is available');
            console.log(`Databases: ${projectInfo.databases.length}`);
        } catch (dbError) {
            console.log('Database service check failed:', dbError.message);
        }

    } catch (error) {
        console.error('❌ Failed to connect to Appwrite:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if your Appwrite instance is running');
        console.log('2. Verify the endpoint URL is correct');
        console.log('3. Check if your API key has the necessary permissions');
        console.log('4. Ensure your project ID is correct');
    }
}

// Run the script
if (require.main === module) {
    checkAppwriteSites().catch(console.error);
}

module.exports = { checkAppwriteSites };