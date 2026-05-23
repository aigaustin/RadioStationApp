const fs = require('fs');
const mediaCpService = require('../services/MediaCpService');

class MediaCpController {
  async getStatus(req, res) {
    try {
      const result = await mediaCpService.getStatus(req.tenantId, req.query.serviceType);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async getOverview(req, res) {
    try {
      const result = await mediaCpService.getOverview(req.tenantId, req.query.serviceType);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async getCredentials(req, res) {
    try {
      const result = await mediaCpService.getCredentials(req.tenantId);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  async performAction(req, res) {
    try {
      const action = req.params.action; // start, stop, restart
      const result = await mediaCpService.performAction(action, req.tenantId, req.query.serviceType, req.user.id, req.user.email, req.ip);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async performAutoDjAction(req, res) {
    try {
      const action = req.params.action; // start, stop, status
      const mappedAction = action === 'status' ? 'autodj_status' : `autodj_${action}`;
      const result = await mediaCpService.performAction(mappedAction, req.tenantId, req.query.serviceType, req.user.id, req.user.email, req.ip);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async uploadMedia(req, res) {
    try {
      if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded' });
      
      const result = await mediaCpService.uploadMedia(req.tenantId, req.query.serviceType, req.file.path, req.file.originalname, req.user.id, req.user.email, req.ip);
      
      try { fs.unlinkSync(req.file.path); } catch(e) {}
      res.json(result);
    } catch (err) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch(e) {}
      }
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async getWidgetSettings(req, res) {
    try {
      const result = await mediaCpService.getWidgetSettings(req.tenantId);
      res.json({ ok: true, data: result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  async saveWidgetSettings(req, res) {
    try {
      const result = await mediaCpService.saveWidgetSettings(req.tenantId, req.body);
      res.json({ ok: true, data: result });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  async listMedia(req, res) {
    try {
      const result = await mediaCpService.listMedia(req.tenantId, req.query.serviceType, req.query.path, req.query.page);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async createFolder(req, res) {
    try {
      const result = await mediaCpService.createFolder(req.tenantId, req.query.serviceType, req.body.path, req.body.title);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async deleteMedia(req, res) {
    try {
      const result = await mediaCpService.deleteMedia(req.tenantId, req.query.serviceType, req.body.trackIds);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async listPlaylists(req, res) {
    try {
      const result = await mediaCpService.listPlaylists(req.tenantId, req.query.serviceType, req.query.page);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async createPlaylist(req, res) {
    try {
      const result = await mediaCpService.createPlaylist(req.tenantId, req.query.serviceType, req.body);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async deletePlaylist(req, res) {
    try {
      const result = await mediaCpService.deletePlaylist(req.tenantId, req.query.serviceType, req.params.id);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }
  async listEvents(req, res) {
    try {
      const result = await mediaCpService.listEvents(req.tenantId, req.query.serviceType, req.query.start, req.query.end);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async createEvent(req, res) {
    try {
      const result = await mediaCpService.createEvent(req.tenantId, req.query.serviceType, req.body);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const result = await mediaCpService.deleteEvent(req.tenantId, req.query.serviceType, req.params.id);
      res.json(result);
    } catch (err) {
      res.status(err.message === 'Server ID not configured' ? 400 : 500).json({ ok: false, error: err.message });
    }
  }
}

module.exports = new MediaCpController();
