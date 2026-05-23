const express = require('express');
const multer = require('multer');
const { requireAuth, requirePermission } = require('../middleware/auth');
const mediaCpController = require('../controllers/MediaCpController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /api/mediacp/status
router.get('/status', requireAuth, requirePermission('mediacp:read'), mediaCpController.getStatus);

// GET /api/mediacp/overview
router.get('/overview', requireAuth, requirePermission('mediacp:read'), mediaCpController.getOverview);

// GET /api/mediacp/credentials
router.get('/credentials', requireAuth, requirePermission('mediacp:read'), mediaCpController.getCredentials);

// POST /api/mediacp/start, /stop, /restart
router.post('/:action(start|stop|restart|kick-source)', requireAuth, requirePermission('mediacp:write'), mediaCpController.performAction);

// GET/POST /api/mediacp/autodj/status, /start, /stop
router.get('/autodj/status', requireAuth, requirePermission('mediacp:read'), mediaCpController.performAutoDjAction);
router.post('/autodj/:action(start|stop)', requireAuth, requirePermission('mediacp:write'), mediaCpController.performAutoDjAction);

// POST /api/mediacp/upload
router.post('/upload', requireAuth, requirePermission('mediacp:write'), upload.single('file'), mediaCpController.uploadMedia);

// GET /api/mediacp/widgets
router.get('/widgets', requireAuth, requirePermission('mediacp:read'), mediaCpController.getWidgetSettings);

// POST /api/mediacp/widgets
router.post('/widgets', requireAuth, requirePermission('mediacp:write'), mediaCpController.saveWidgetSettings);

// Media Manager
router.get('/media', requireAuth, requirePermission('mediacp:read'), mediaCpController.listMedia);
router.post('/media/folder', requireAuth, requirePermission('mediacp:write'), mediaCpController.createFolder);
router.post('/media/delete', requireAuth, requirePermission('mediacp:write'), mediaCpController.deleteMedia);

// Playlists
router.get('/playlists', requireAuth, requirePermission('mediacp:read'), mediaCpController.listPlaylists);
router.post('/playlists', requireAuth, requirePermission('mediacp:write'), mediaCpController.createPlaylist);
router.delete('/playlists/:id', requireAuth, requirePermission('mediacp:write'), mediaCpController.deletePlaylist);

// Events
router.get('/events', requireAuth, requirePermission('mediacp:read'), mediaCpController.listEvents);
router.post('/events', requireAuth, requirePermission('mediacp:write'), mediaCpController.createEvent);
router.delete('/events/:id', requireAuth, requirePermission('mediacp:write'), mediaCpController.deleteEvent);

module.exports = router;
