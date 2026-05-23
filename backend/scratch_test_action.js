const MediaCPRestClient = require('./lib/mediacp-rest');

async function testAction() {
  const client = new MediaCPRestClient('https://cp.streamo.ng:2020', 'hsqEeaqkW5mbWcldf6ql0oh3sHlmnIddmJ-5X5aoiM-YqHqX0XeDlA==');
  try {
    const res = await client.request('GET', `/api/1/media-service/stop-service`);
    console.log('Stop Result:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.log('Stop Error:', e.message);
  }

  try {
    const res = await client.request('GET', `/api/1/media-service/start-service`);
    console.log('Start Result:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.log('Start Error:', e.message);
  }
}

testAction().then(() => process.exit(0));
