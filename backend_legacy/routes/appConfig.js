const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const appConfigController = require('../controllers/AppConfigController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// GET /api/appConfig
router.get('/', requireAuth, appConfigController.getConfig);

// PUT /api/appConfig/profile
router.put('/profile', requireAuth, appConfigController.updateProfile);

// PUT /api/appConfig/branding
router.put('/branding', requireAuth, appConfigController.updateBranding);

// PUT /api/appConfig/contact
router.put('/contact', requireAuth, appConfigController.updateContact);

// PUT /api/appConfig/social
router.put('/social', requireAuth, appConfigController.updateSocial);

// POST /api/appConfig/upload
router.post('/upload', requireAuth, upload.single('file'), appConfigController.uploadFile);

module.exports = router;
