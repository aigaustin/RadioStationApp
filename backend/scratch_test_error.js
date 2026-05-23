const MediaCPRestClient = require('./lib/mediacp-rest');

async function testSync() {
  try {
    const client = new MediaCPRestClient('https://cp.streamo.ng:2020', 'invalid_key');
    const services = await client.listServices();
    console.log("Invalid key response:", JSON.stringify(services, null, 2));
  } catch (error) {
    console.error('Invalid key error:', error.message);
  }
}

testSync().then(() => process.exit(0));
