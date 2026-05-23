const MediaCpService = require('./services/MediaCpService');
const MediaCPRestClient = require('./lib/mediacp-rest');

async function testSync() {
  console.log('Testing MediaCP Sync...');
  try {
    const creds = await MediaCpService.getCredentials('global');
    console.log(JSON.stringify(creds, null, 2));

    // Test raw client
    console.log('\n--- Testing RAW Client listServices ---');
    const client = new MediaCPRestClient('https://cp.streamo.ng:2020', 'g5-Io3vVWpvOV5SHr3_QqVmp33eYmldWm9OIWcZ4iJybpqeazqq1mw==');
    const services = await client.listServices();
    console.log(JSON.stringify(services, null, 2));
  } catch (error) {
    console.error('Error syncing:', error.message);
  }
}

testSync().then(() => process.exit(0));
