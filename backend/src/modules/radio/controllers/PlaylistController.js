class PlaylistController {
  
  static async createPlaylist(req, res, prisma) {
    try {
      const { radioStationId, name, type, weight } = req.body;
      if (!radioStationId || !name) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }

      const playlist = await prisma.playlist.create({
        data: {
          radioStationId,
          name,
          type: type || 'standard',
          weight: weight || 1
        }
      });
      res.json({ ok: true, data: playlist });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async listPlaylists(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      const playlists = await prisma.playlist.findMany({
        where: { radioStationId },
        include: {
          items: {
            include: { media: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ ok: true, data: playlists });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async addMediaToPlaylist(req, res, prisma) {
    try {
      const { playlistId, mediaId } = req.body;
      
      // Auto-assign sort order to end
      const lastItem = await prisma.playlistItem.findFirst({
        where: { playlistId },
        orderBy: { sortOrder: 'desc' }
      });
      const sortOrder = lastItem ? lastItem.sortOrder + 1 : 0;

      const item = await prisma.playlistItem.create({
        data: {
          playlistId,
          mediaId,
          sortOrder
        }
      });

      res.json({ ok: true, data: item });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

}

module.exports = PlaylistController;
