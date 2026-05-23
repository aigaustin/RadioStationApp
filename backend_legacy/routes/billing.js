const express = require('express');
const { requireAuth, requireGlobalAdmin } = require('../middleware/auth');
const billingController = require('../controllers/BillingController');

const router = express.Router();

// POST /api/billing/checkout - Initiates a checkout session
router.post('/checkout', requireAuth, billingController.checkout);

// GET /api/billing/subscriptions - Get tenant subscriptions
router.get('/subscriptions', requireAuth, billingController.getSubscriptions);

// GET /api/billing/all-subscriptions - Get all subscriptions across platform (Super Admin)
router.get('/all-subscriptions', requireAuth, requireGlobalAdmin, billingController.getAllSubscriptions);

// WEBHOOKS
// POST /api/billing/webhooks/paystack
router.post('/webhooks/paystack', express.json(), billingController.handlePaystackWebhook);

// POST /api/billing/webhooks/flutterwave
router.post('/webhooks/flutterwave', express.json(), billingController.handleFlutterwaveWebhook);

module.exports = router;
