const { Worker } = require('bullmq');
const prisma = require('../lib/prisma');
const { connection } = require('../lib/queue');
const MediaCPRestClient = require('../lib/mediacp-rest');

const syncWorker = new Worker('syncQueue', async (job) => {
  const { tenantId, serviceId, internalId } = job.data;
  
  if (!serviceId) {
    throw new Error('No MediaCP serviceId provided for sync');
  }

  const rpcUrl = process.env.MEDIACP_API_URL;
  const apiKey = process.env.MEDIACP_API_KEY;

  if (!rpcUrl || !apiKey) {
    throw new Error('MediaCP API credentials not configured in env.');
  }

  const client = new MediaCPRestClient(rpcUrl, apiKey, tenantId);

  try {
    // 1. Fetch current status from MediaCP
    const statusData = await client.getServiceStatus(serviceId);
    
    // MediaCP typically returns { state: "online" } or similar
    // This depends on the exact API shape, but we normalize it
    const isOnline = statusData && (statusData.state === 'online' || statusData.state === 'running');
    const isSuspended = statusData && statusData.state === 'suspended';

    let localStatus = 'active';
    if (isSuspended) localStatus = 'suspended';
    else if (!isOnline) localStatus = 'offline';

    // 2. Sync to local database
    if (internalId) {
      await prisma.mediaCpService.update({
        where: { id: internalId },
        data: {
          status: localStatus,
          updatedAt: new Date()
        }
      });
    }

    return { success: true, serviceId, syncedStatus: localStatus };
  } catch (error) {
    throw new Error(`MediaCP Sync Failed: ${error.message}`);
  }
}, { connection });

syncWorker.on('completed', (job, returnvalue) => {
  console.log(`[Sync Worker] Job ${job.id} completed. Service ${returnvalue.serviceId} is ${returnvalue.syncedStatus}`);
});

syncWorker.on('failed', (job, err) => {
  console.error(`[Sync Worker] Job ${job.id} failed:`, err);
});

module.exports = syncWorker;
