const express = require('express');
const MediaController = require('./controllers/MediaController');
const PlaylistController = require('./controllers/PlaylistController');
const DjController = require('./controllers/DjController');
const SettingsController = require('./controllers/SettingsController');
const WebController = require('./controllers/WebController');
const AnalyticsController = require('./controllers/AnalyticsController');
const ScheduleController = require('./controllers/ScheduleController');

module.exports = {
  id: 'radio',
  name: 'Streamo Radio Manager',
  version: '1.0.0',
  description: 'Manages Icecast/Shoutcast instances, AutoDJ (Liquidsoap), Playlists, Jingles, and DJs.',
  
  // Exposes Express routes for this module
  routes: (prisma) => {
    const router = express.Router();
    
    router.get('/status', (req, res) => {
      res.json({ ok: true, message: 'Radio module is active.' });
    });

    // Settings & Mount Points
    router.post('/configure', (req, res) => SettingsController.configureStream(req, res, prisma));
    router.get('/mounts', (req, res) => SettingsController.getMountPoints(req, res, prisma));
    router.post('/suspend', (req, res) => SettingsController.suspendService(req, res, prisma));
    router.delete('/service/:radioStationId', (req, res) => SettingsController.deleteService(req, res, prisma));
    
    // Media Manager
    router.post('/media', MediaController.getUploadMiddleware(), (req, res) => MediaController.uploadMedia(req, res, prisma));
    router.get('/media', (req, res) => MediaController.listMedia(req, res, prisma));
    
    // Playlists
    router.post('/playlists', (req, res) => PlaylistController.createPlaylist(req, res, prisma));
    router.get('/playlists', (req, res) => PlaylistController.listPlaylists(req, res, prisma));
    router.post('/playlists/items', (req, res) => PlaylistController.addMediaToPlaylist(req, res, prisma));
    
    // DJs
    router.post('/djs', (req, res) => DjController.createDj(req, res, prisma));
    router.get('/djs', (req, res) => DjController.listDjs(req, res, prisma));
    router.delete('/djs/:id', (req, res) => DjController.deleteDj(req, res, prisma));

    // Schedule & Web
    router.post('/schedule', (req, res) => ScheduleController.createSchedule(req, res, prisma));
    router.get('/schedule', (req, res) => ScheduleController.listSchedules(req, res, prisma));
    router.delete('/schedule/:id', (req, res) => ScheduleController.deleteSchedule(req, res, prisma));
    
    router.get('/widgets', (req, res) => WebController.getWidgets(req, res, prisma));

    // Analytics & Logs
    router.get('/logs', (req, res) => AnalyticsController.getLogs(req, res));
    router.get('/reporting', (req, res) => AnalyticsController.getReporting(req, res, prisma));
    router.get('/listener-map', (req, res) => AnalyticsController.getListenerMap(req, res, prisma));

    return router;
  },

  // Called during core startup to sync containers
  bootstrap: async (prisma) => {
    console.log('[Radio Module] Bootstrapping background orchestrators...');
    // TODO: Verify Docker daemon connection
    // TODO: Sync database state with running containers (Icecast/Liquidsoap)
  }
};
