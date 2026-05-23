class WebController {
  
  static async getSchedule(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      const schedules = await prisma.schedule.findMany({
        where: { radioStationId },
        include: { playlist: true },
        orderBy: { startTime: 'asc' }
      });
      res.json({ ok: true, data: schedules });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async getWidgets(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      const station = await prisma.radioStation.findUnique({ where: { id: radioStationId } });
      if (!station) return res.status(404).json({ ok: false, error: 'Station not found' });
      
      const domain = req.get('host') || 'streamo.ng';
      
      const widgets = {
        playerEmbed: `<iframe src="https://${domain}/embed/player/${radioStationId}" width="100%" height="150" frameborder="0"></iframe>`,
        nowPlayingEmbed: `<iframe src="https://${domain}/embed/nowplaying/${radioStationId}" width="100%" height="50" frameborder="0"></iframe>`,
        publicPageUrl: `https://${domain}/station/${station.slug || radioStationId}`
      };
      
      res.json({ ok: true, data: widgets });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = WebController;
