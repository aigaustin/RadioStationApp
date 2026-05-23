const MediaCPRestClient = require('./lib/mediacp-rest');

async function testSync() {
  try {
    const client = new MediaCPRestClient('https://cp.streamo.ng:2020', 'hsqEeaqkW5mbWcldf6ql0oh3sHlmnIddmJ-5X5aoiM-YqHqX0XeDlA==');
    
    console.log("Testing without user_id param...");
    const services = await client.request('GET', '/api/0/media-service/list');
    console.log(JSON.stringify(services, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSync().then(() => process.exit(0));
