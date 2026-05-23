const crypto = require('crypto');
const prisma = require('../lib/prisma');
const PaystackProvider = require('./billing/PaystackProvider');
const FlutterwaveProvider = require('./billing/FlutterwaveProvider');
const { billingQueue, provisioningQueue } = require('../lib/queue');

class BillingService {
  async checkout(planId, provider, tenantId, userId) {
    if (!['PAYSTACK', 'FLUTTERWAVE'].includes(provider)) {
      throw new Error('Invalid provider. Must be PAYSTACK or FLUTTERWAVE');
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new Error('Plan not found or inactive');
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Handle Trial Plan Checkout
    if (plan.trialDays > 0) {
      const existingSub = await prisma.subscription.findFirst({ where: { tenantId } });
      if (existingSub) {
        throw new Error('You have already used a trial or have an existing subscription.');
      }

      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + plan.trialDays);

      const subscription = await prisma.subscription.create({
        data: {
          tenantId,
          planId: plan.id,
          status: 'TRIALING',
          nextBillingDate
        }
      });

      // Skip payment, generate invoice
      await prisma.invoice.create({
        data: {
          tenantId,
          subscriptionId: subscription.id,
          amount: 0,
          status: 'PAID',
          paidAt: new Date()
        }
      });

      // Queue Provisioning directly
      const provisioningJob = await prisma.provisioningJob.create({
        data: {
          tenantId,
          subscriptionId: subscription.id,
          status: 'PENDING',
          payload: { planId: plan.id }
        }
      });

      await provisioningQueue.add('provisionService', {
        provisioningJobId: provisioningJob.id,
        tenantId,
        planId: plan.id
      });

      return { paymentUrl: null, reference: 'TRIAL', message: 'Trial activated successfully. Provisioning your server.' };
    }

    // Generate unique reference
    const reference = `${provider.substring(0, 2)}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create a pending subscription
    const subscription = await prisma.subscription.create({
      data: { tenantId, planId: plan.id, status: 'PENDING' }
    });

    // Create a pending payment
    await prisma.payment.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: 'NGN',
        provider,
        reference,
        status: 'PENDING'
      }
    });

    // Call Gateway
    let paymentUrl = '';
    const metadata = { tenantName: tenant.name, planName: plan.name };
    if (provider === 'PAYSTACK') {
      paymentUrl = await PaystackProvider.initializePayment(plan.price, user.email, reference, metadata);
    } else {
      paymentUrl = await FlutterwaveProvider.initializePayment(plan.price, user.email, reference, metadata);
    }

    return { paymentUrl, reference };
  }

  async getSubscriptions(tenantId) {
    return prisma.subscription.findMany({
      where: { tenantId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllSubscriptions() {
    return prisma.subscription.findMany({
      include: { plan: true, tenant: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async handlePaystackWebhook(event, signature, bodyStr) {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
                       .update(bodyStr).digest('hex');
    if (hash !== signature) {
      throw new Error('Invalid signature');
    }

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      await billingQueue.add('verifyPaystack', { reference, provider: 'PAYSTACK' });
    }
  }

  async handleFlutterwaveWebhook(event, signature) {
    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      if (process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
        throw new Error('Invalid signature');
      }
    }

    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const reference = event.data.tx_ref;
      await billingQueue.add('verifyFlutterwave', { reference, provider: 'FLUTTERWAVE' });
    }
  }
}

module.exports = new BillingService();
