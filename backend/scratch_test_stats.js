const MediaCPRestClient = require('./lib/mediacp-rest');

async function testServices() {
  const client = new MediaCPRestClient('https://cp.streamo.ng:2020', 'hsqEeaqkW5mbWcldf6ql0oh3sHlmnIddmJ-5X5aoiM-YqHqX0XeDlA==');
  try {
    const list = await client.listServices(null);
    console.log('List Services Stats:', list[0]?.stats);

    const service = await client.getService(1);
    console.log('Get Service Stats:', service?.stats);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

testServices().then(() => process.exit(0));
