const { Worker } = require('bullmq');
const prisma = require('../lib/prisma');
const { connection, provisioningQueue } = require('../lib/queue');

async function processBillingJob(job) {
  const { reference, provider } = job.data;

  // Find payment and subscription
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { subscription: true }
  });

  if (!payment) {
    throw new Error(`Payment with reference ${reference} not found.`);
  }

  if (payment.status === 'SUCCESS') {
    // Idempotency check: already processed
    job.log(`Payment ${reference} already marked as SUCCESS.`);
    return { status: 'already_processed' };
  }

  // Update payment status
  await prisma.payment.update({
    where: { reference },
    data: { status: 'SUCCESS' }
  });

  job.log(`Payment ${reference} marked as SUCCESS.`);

  const sub = payment.subscription;
  if (sub && sub.status === 'PENDING') {
    const plan = await prisma.plan.findUnique({ where: { id: sub.planId } });
    
    // Calculate next billing date
    const nextDate = new Date();
    if (plan.interval === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    // Activate subscription
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'ACTIVE', nextBillingDate: nextDate }
    });

    job.log(`Subscription ${sub.id} activated.`);

    // Generate Invoice
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: payment.tenantId,
        subscriptionId: sub.id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'PAID',
        paidAt: new Date()
      }
    });

    // Link payment to invoice
    await prisma.payment.update({
      where: { reference },
      data: { invoiceId: invoice.id }
    });

    job.log(`Subscription ${sub.id} activated.`);

    // Enqueue provisioning job
    const provisioningJobRecord = await prisma.provisioningJob.create({
      data: {
        tenantId: payment.tenantId,
        subscriptionId: sub.id,
        status: 'PENDING',
        payload: { planId: plan.id }
      }
    });

    await provisioningQueue.add('provisionService', {
      provisioningJobId: provisioningJobRecord.id,
      tenantId: payment.tenantId,
      planId: plan.id
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    job.log(`Provisioning job ${provisioningJobRecord.id} enqueued.`);
  }

  return { status: 'success' };
}

const billingWorker = new Worker('billingQueue', processBillingJob, { connection });

billingWorker.on('completed', (job, returnvalue) => {
  console.log(`[billingQueue] Job ${job.id} completed with status: ${returnvalue.status}`);
});

billingWorker.on('failed', (job, err) => {
  console.error(`[billingQueue] Job ${job.id} failed:`, err);
});

module.exports = billingWorker;
