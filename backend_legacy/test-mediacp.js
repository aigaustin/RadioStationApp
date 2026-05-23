require('dotenv').config();
const mediaCpService = require('./services/MediaCpService');

(async () => {
  try {
    const tenantId = 'ba45948b-852b-45d5-80a3-8c38a7c21c69';
    console.log("Fetching events...");
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const result = await mediaCpService.listEvents(tenantId, 'radio', today, tomorrow);
    console.log(JSON.stringify(result, null, 2));
    
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    process.exit(0);
  }
})();
