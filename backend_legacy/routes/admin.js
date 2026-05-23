const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireGlobalAdmin } = require('../middleware/auth');

// Require global admin for all admin routes
router.use(requireAuth, requireGlobalAdmin);

// GET /api/admin/tenants - List all tenants
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ data: tenants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/tenants/:id/features - Get tenant features
router.get('/tenants/:id/features', async (req, res) => {
  try {
    const configDoc = await prisma.config.findUnique({
      where: { tenantId_key: { tenantId: req.params.id, key: 'global' } }
    });
    const cfg = configDoc ? configDoc.value : {};
    res.json({ data: cfg.features || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/tenants/:id/features - Update tenant features
router.put('/tenants/:id/features', async (req, res) => {
  try {
    const configDoc = await prisma.config.findUnique({
      where: { tenantId_key: { tenantId: req.params.id, key: 'global' } }
    });
    const current = configDoc ? configDoc.value : {};
    
    const features = { ...(current.features || {}) };
    if (typeof req.body.enablePodcasts === 'boolean') features.enablePodcasts = req.body.enablePodcasts;
    if (typeof req.body.enableSchedule === 'boolean') features.enableSchedule = req.body.enableSchedule;
    if (typeof req.body.enableNotifications === 'boolean') features.enableNotifications = req.body.enableNotifications;
    
    current.features = features;

    await prisma.config.upsert({
      where: { tenantId_key: { tenantId: req.params.id, key: 'global' } },
      update: { value: current },
      create: { tenantId: req.params.id, key: 'global', value: current }
    });

    res.json({ ok: true, data: features });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/provisioning-jobs
router.get('/provisioning-jobs', async (req, res) => {
  try {
    const jobs = await prisma.provisioningJob.findMany({
      include: { tenant: true, subscription: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/provisioning-jobs/:id/retry
router.post('/provisioning-jobs/:id/retry', async (req, res) => {
  try {
    const job = await prisma.provisioningJob.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    const { provisioningQueue } = require('../lib/queue');
    await provisioningQueue.add('provisionService', {
      provisioningJobId: job.id,
      tenantId: job.tenantId,
      planId: job.payload.planId
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    await prisma.provisioningJob.update({
      where: { id: job.id },
      data: { status: 'PENDING' }
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const fs = require('fs');
const path = require('path');

// GET /api/admin/setup - Get environment variables
router.get('/setup', async (req, res) => {
  try {
    res.json({
      data: {
        PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || '',
        PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? '********' : '',
        FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
        FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY ? '********' : '',
        MEDIACP_API_URL: process.env.MEDIACP_API_URL || '',
        MEDIACP_API_KEY: process.env.MEDIACP_API_KEY ? '********' : ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/setup - Update environment variables
router.put('/setup', async (req, res) => {
  try {
    const { 
      PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY, 
      FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY,
      MEDIACP_API_URL, MEDIACP_API_KEY
    } = req.body;

    const updates = {};
    if (PAYSTACK_PUBLIC_KEY !== undefined) updates.PAYSTACK_PUBLIC_KEY = PAYSTACK_PUBLIC_KEY;
    if (PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY !== '********') updates.PAYSTACK_SECRET_KEY = PAYSTACK_SECRET_KEY;
    if (FLUTTERWAVE_PUBLIC_KEY !== undefined) updates.FLUTTERWAVE_PUBLIC_KEY = FLUTTERWAVE_PUBLIC_KEY;
    if (FLUTTERWAVE_SECRET_KEY && FLUTTERWAVE_SECRET_KEY !== '********') updates.FLUTTERWAVE_SECRET_KEY = FLUTTERWAVE_SECRET_KEY;
    if (MEDIACP_API_URL !== undefined) updates.MEDIACP_API_URL = MEDIACP_API_URL;
    if (MEDIACP_API_KEY && MEDIACP_API_KEY !== '********') updates.MEDIACP_API_KEY = MEDIACP_API_KEY;

    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    for (const [key, value] of Object.entries(updates)) {
      process.env[key] = value;
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    res.json({ ok: true, message: 'Settings updated and applied globally.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
