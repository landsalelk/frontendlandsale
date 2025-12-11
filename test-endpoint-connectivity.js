// Test basic connectivity to Appwrite endpoint
const https = require('https');

function testEndpointConnectivity() {
    console.log('Testing Appwrite endpoint connectivity...');
    console.log('Endpoint: https://sgp.cloud.appwrite.io/v1');
    
    const options = {
        hostname: 'sgp.cloud.appwrite.io',
        port: 443,
        path: '/v1/health',
        method: 'GET',
        timeout: 10000
    };
    
    const req = https.request(options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Status Message: ${res.statusMessage}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', data);
            if (res.statusCode === 200) {
                console.log('✅ Endpoint is reachable');
            } else {
                console.log('⚠️  Endpoint responded with non-200 status');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Connection failed:', error.message);
        if (error.code === 'ENOTFOUND') {
            console.error('The hostname could not be resolved. Please check the endpoint URL.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused. The server may be down or blocking requests.');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('Connection timed out. The server may be slow or unreachable.');
        }
    });
    
    req.on('timeout', () => {
        console.error('❌ Request timed out');
        req.destroy();
    });
    
    req.end();
}

testEndpointConnectivity();