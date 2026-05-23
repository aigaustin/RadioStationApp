class SettingsController {
  
  static async configureStream(req, res, prisma) {
    try {
      const { radioStationId, name, description, bitrate, format, autoDjEnabled } = req.body;
      if (!radioStationId) return res.status(400).json({ ok: false, error: 'radioStationId required' });

      const updated = await prisma.radioStation.update({
        where: { id: radioStationId },
        data: {
          name,
          description,
          bitrate: bitrate || 128,
          format: format || 'mp3',
          autoDjEnabled: typeof autoDjEnabled === 'boolean' ? autoDjEnabled : true
        }
      });
      res.json({ ok: true, data: updated });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async getMountPoints(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      const station = await prisma.radioStation.findUnique({ where: { id: radioStationId } });
      if (!station) return res.status(404).json({ ok: false, error: 'Station not found' });

      // In a real scenario, this would query Icecast admin API to get active mount points
      // For Streamo Core, we hardcode the known structural mount points
      const mounts = [
        { name: 'Live DJ Stream', path: '/live', active: false },
        { name: 'AutoDJ Stream', path: '/autodj', active: station.autoDjEnabled },
        { name: 'Public Stream (Main)', path: station.mountPoint || '/stream', active: true }
      ];

      res.json({ ok: true, data: mounts });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async suspendService(req, res, prisma) {
    try {
      const { radioStationId } = req.body;
      await prisma.radioStation.update({
        where: { id: radioStationId },
        data: { status: 'suspended' }
      });
      // TODO: Tell DockerOrchestrator to stop containers
      res.json({ ok: true, message: 'Service suspended' });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async deleteService(req, res, prisma) {
    try {
      const { radioStationId } = req.params;
      const station = await prisma.radioStation.findUnique({ where: { id: radioStationId } });
      if (station) {
        // TODO: Tell DockerOrchestrator to remove containers entirely
        await prisma.radioStation.delete({ where: { id: radioStationId } });
      }
      res.json({ ok: true, message: 'Service deleted' });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = SettingsController;
