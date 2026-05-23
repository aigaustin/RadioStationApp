const { Queue } = require('bullmq');

const connection = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

// Create Queues
const provisioningQueue = new Queue('provisioningQueue', { connection });
const billingQueue = new Queue('billingQueue', { connection });
const syncQueue = new Queue('syncQueue', { connection });

module.exports = {
  connection,
  provisioningQueue,
  billingQueue,
  syncQueue,
};
