require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

// This is a server-side script, so we use the Node.js SDK
const client = new sdk.Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

async function verifyApiKeyPermissions() {
    console.log('🔍 Verifying Appwrite API Key Permissions...');
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    // WARNING: Do not log the API key itself for security reasons.

    try {
        // Attempt to list databases to check if 'databases.read' scope is present
        // If this fails, it means the API key doesn't have sufficient permissions
        const response = await databases.list();
        console.log('✅ Successfully connected to Appwrite and listed databases.');
        console.log('Available databases:', response.databases.map(db => db.name));
        console.log('Your API key has at least "databases.read" permission.');

        // If we reach here, it means the key has some read access.
        // The MCP tools require write access.
        // We can't directly list the scopes of the API key itself via the SDK for security reasons.
        // However, if 'databases.list()' works, and 'createTable' fails, it confirms
        // that write permissions are missing.

        console.log('To ensure full MCP functionality, please double-check that your API key in the Appwrite console has the following scopes enabled:');
        console.log('- databases.write');
        console.log('- tables.write');
        console.log('- columns.write');
        console.log('- indexes.write');
        console.log('- rows.write');

    } catch (error) {
        console.error('❌ Failed to verify Appwrite API Key Permissions.');
        console.error('Error:', error.message);
        if (error.code === 401) {
            console.error('This usually means the API key is missing required scopes or is invalid.');
            console.error('Please ensure your API key has at least "databases.read" permission to perform this check.');
        } else if (error.code === 404) {
            console.error('Project ID or Endpoint might be incorrect.');
        }
    }
}

verifyApiKeyPermissions();
