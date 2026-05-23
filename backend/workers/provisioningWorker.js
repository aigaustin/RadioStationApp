const { Worker } = require('bullmq');
const prisma = require('../lib/prisma');
const { connection } = require('../lib/queue');
const MediaCpProvisioningService = require('../services/MediaCpProvisioningService');

async function processProvisioningJob(job) {
  const { provisioningJobId, tenantId, planId } = job.data;

  // 1. Fetch Job
  const provJob = await prisma.provisioningJob.findUnique({
    where: { id: provisioningJobId }
  });

  if (!provJob) {
    throw new Error(`Provisioning Job ${provisioningJobId} not found.`);
  }

  // 2. Mark Processing
  await prisma.provisioningJob.update({
    where: { id: provisioningJobId },
    data: { 
      status: 'PROCESSING',
      attempts: { increment: 1 }
    }
  });

  job.log(`Provisioning job ${provisioningJobId} marked as PROCESSING.`);

  try {
    // 3. Execute Provisioning
    const mcpService = await MediaCpProvisioningService.provisionService(tenantId, planId, provisioningJobId);
    
    // 4. Mark Completed
    await prisma.provisioningJob.update({
      where: { id: provisioningJobId },
      data: {
        status: 'COMPLETED',
        payload: {
          ...provJob.payload,
          mediaCpServiceId: mcpService.id,
          completedAt: new Date().toISOString()
        }
      }
    });

    job.log(`Provisioning job ${provisioningJobId} COMPLETED successfully. Service ID: ${mcpService.id}`);

    // Send Onboarding Email (Best effort)
    try {
      const owner = await prisma.user.findFirst({ where: { tenantId, role: { name: 'Owner' } } }) || await prisma.user.findFirst({ where: { tenantId } });
      const globalSmtpRecord = await prisma.config.findUnique({ where: { tenantId_key: { tenantId: 'global', key: 'smtp' } } });
      const smtpConfig = globalSmtpRecord ? globalSmtpRecord.value : null;

      if (owner) {
        const { sendEmail } = require('../lib/email');
        await sendEmail(smtpConfig, {
          to: owner.email,
          subject: 'Your New Service is Ready!',
          text: `Hello ${owner.firstName || ''},\n\nYour service has been successfully provisioned.\nYour service domain: ${mcpService.domain}\nStreaming password: ${mcpService.streamPassword}\n\nLogin to the dashboard to manage your service.\n\nThank you!`
        });
      }
    } catch (emailErr) {
      console.error("Failed to send onboarding email:", emailErr);
    }

    return { status: 'success', serviceId: mcpService.id };
  } catch (error) {
    // Mark Failed (or Retrying if handled by bullmq retry logic)
    const newStatus = job.attemptsMade < job.opts.attempts ? 'RETRYING' : 'FAILED';
    
    await prisma.provisioningJob.update({
      where: { id: provisioningJobId },
      data: {
        status: newStatus,
        errorLogs: { message: error.message, stack: error.stack, time: new Date().toISOString() }
      }
    });

    job.log(`Provisioning job ${provisioningJobId} ${newStatus}: ${error.message}`);
    throw error; // Let BullMQ handle retry mechanism
  }
}

const provisioningWorker = new Worker('provisioningQueue', processProvisioningJob, { connection });

provisioningWorker.on('completed', (job, returnvalue) => {
  console.log(`[provisioningQueue] Job ${job.id} completed. Status: ${returnvalue.status}`);
});

provisioningWorker.on('failed', (job, err) => {
  console.error(`[provisioningQueue] Job ${job.id} failed:`, err);
});

module.exports = provisioningWorker;
