const { syncQueue } = require('../lib/queue');
const prisma = require('../lib/prisma');

async function dispatchSyncJobs() {
  try {
    const activeServices = await prisma.mediaCpService.findMany({
      where: {
        status: {
          not: 'deleted'
        },
        serviceId: {
          not: null
        }
      }
    });

    for (const s of activeServices) {
      await syncQueue.add('syncStatus', {
        tenantId: s.tenantId,
        internalId: s.id,
        serviceId: s.serviceId
      });
    }
  } catch (err) {
    console.error('[Cron] Error dispatching sync jobs', err);
  }
}

// Run every 5 minutes
setInterval(dispatchSyncJobs, 5 * 60 * 1000);

// Also run once on startup after a small delay
setTimeout(dispatchSyncJobs, 10 * 1000);

module.exports = { dispatchSyncJobs };
