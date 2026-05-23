const MediaCpService = require('./services/MediaCpService');

async function testOverview() {
  try {
    const res = await MediaCpService.getOverview('ba45948b-852b-45d5-80a3-8c38a7c21c69', 'radio');
    console.log('Stream URL:', res.streamUrl);
    console.log('Domain:', res.domain);
    console.log('Server Hostname:', res.server_hostname);
    console.log('Portbase:', res.portbase);
    
    // Also test it with curl to see if it responds with an audio stream
    const execSync = require('child_process').execSync;
    try {
      console.log('Running curl -I ' + res.streamUrl);
      const headers = execSync('curl -I -s ' + res.streamUrl).toString();
      console.log('Headers:', headers);
    } catch(e) {
      console.log('Curl failed', e.message);
    }

  } catch (e) {
    console.error(e);
  }
}

testOverview().then(() => process.exit(0));
