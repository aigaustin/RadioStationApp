const billingService = require('../services/BillingService');

class BillingController {
  async checkout(req, res) {
    try {
      const { planId, provider } = req.body;
      const result = await billingService.checkout(planId, provider, req.tenantId, req.user.id);
      res.json(result);
    } catch (error) {
      const isClientError = ['Invalid provider. Must be PAYSTACK or FLUTTERWAVE', 'Plan not found or inactive', 'You have already used a trial or have an existing subscription.'].includes(error.message);
      res.status(isClientError ? 400 : 500).json({ error: error.message });
    }
  }

  async getSubscriptions(req, res) {
    try {
      const subs = await billingService.getSubscriptions(req.tenantId);
      res.json({ data: subs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllSubscriptions(req, res) {
    try {
      const subs = await billingService.getAllSubscriptions();
      res.json({ data: subs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handlePaystackWebhook(req, res) {
    try {
      const signature = req.headers['x-paystack-signature'];
      const bodyStr = JSON.stringify(req.body);
      
      await billingService.handlePaystackWebhook(req.body, signature, bodyStr);
      res.sendStatus(200);
    } catch (error) {
      if (error.message === 'Invalid signature') {
        return res.status(401).send('Invalid signature');
      }
      res.sendStatus(500);
    }
  }

  async handleFlutterwaveWebhook(req, res) {
    try {
      const signature = req.headers['verif-hash'];
      await billingService.handleFlutterwaveWebhook(req.body, signature);
      res.sendStatus(200);
    } catch (error) {
      if (error.message === 'Invalid signature') {
        return res.status(401).send('Invalid signature');
      }
      res.sendStatus(500);
    }
  }
}

module.exports = new BillingController();
