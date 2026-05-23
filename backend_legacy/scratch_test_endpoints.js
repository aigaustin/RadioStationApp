const MediaCPRestClient = require('./lib/mediacp-rest');

async function testApi() {
  const client = new MediaCPRestClient('https://cp.streamo.ng:2020', 'hsqEeaqkW5mbWcldf6ql0oh3sHlmnIddmJ-5X5aoiM-YqHqX0XeDlA==');
  try {
    const endpoints = [
      '/api/1/media-service/recent-tracks',
      '/api/1/media-service/history',
      '/api/1/media-service/listeners',
      '/api/1/media-service/stats',
      '/api/1/media-service/widgets'
    ];
    for (const ep of endpoints) {
      console.log('Testing', ep);
      try {
        const res = await client.request('GET', ep);
        console.log(ep, 'SUCCESS:', JSON.stringify(res).substring(0, 100));
      } catch (e) {
        console.log(ep, 'FAILED:', e.message);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

testApi().then(() => process.exit(0));
