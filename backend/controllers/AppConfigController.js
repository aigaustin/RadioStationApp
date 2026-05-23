const appConfigService = require('../services/AppConfigService');

class AppConfigController {
  async getConfig(req, res) {
    try {
      const data = await appConfigService.getConfig(req.tenantId);
      res.json({ ok: true, data });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, description, maintenance } = req.body;
      const data = await appConfigService.updateProfile(req.tenantId, { name, description, maintenance });
      res.json({ ok: true, data });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async updateBranding(req, res) {
    try {
      const { primaryColor, accentColor, theme, logoUrl, splashUrl } = req.body;
      const data = await appConfigService.updateBranding(req.tenantId, { primaryColor, accentColor, theme, logoUrl, splashUrl });
      res.json({ ok: true, data });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async updateContact(req, res) {
    try {
      const { phone, email, address, whatsapp, website, privacyUrl, termsUrl, supportUrl } = req.body;
      const data = await appConfigService.updateContact(req.tenantId, { phone, email, address, whatsapp, website, privacyUrl, termsUrl, supportUrl });
      res.json({ ok: true, data });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async updateSocial(req, res) {
    try {
      const { facebook, twitter, instagram, youtube } = req.body;
      const data = await appConfigService.updateSocial(req.tenantId, { facebook, twitter, instagram, youtube });
      res.json({ ok: true, data });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async uploadFile(req, res) {
    try {
      if (!req.file) return res.status(400).json({ ok: false, error: 'No file provided' });
      
      const url = await appConfigService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      res.json({ ok: true, url });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
}

module.exports = new AppConfigController();
