const MediaCpService = require('./services/MediaCpService');

async function testOverview() {
  try {
    const res = await MediaCpService.getOverview('ba45948b-852b-45d5-80a3-8c38a7c21c69', 'radio');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testOverview().then(() => process.exit(0));
