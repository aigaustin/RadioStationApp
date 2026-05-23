const bcrypt = require('bcryptjs');

class DjController {
  
  // Creates a DJ account and associates it with a specific radio station
  static async createDj(req, res, prisma) {
    try {
      const { tenantId, radioStationId, username, password, email } = req.body;
      if (!tenantId || !radioStationId || !username || !password) {
        return res.status(400).json({ ok: false, error: 'Missing required DJ fields' });
      }

      // Check if username already exists globally (or within tenant)
      const existing = await prisma.user.findUnique({ where: { email: username } });
      if (existing) {
        return res.status(400).json({ ok: false, error: 'Username already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      const dj = await prisma.user.create({
        data: {
          email: username, // using email field as username for DJs to unify authentication
          passwordHash,
          role: 'DJ',
          tenantId
        }
      });

      // When the DJ logs in, they stream to /live on Icecast
      // Liquidsoap is configured to transition from autodj -> live when /live connects.

      res.json({ ok: true, data: { id: dj.id, username: dj.email, role: dj.role } });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async listDjs(req, res, prisma) {
    try {
      const { tenantId } = req.query;
      const djs = await prisma.user.findMany({
        where: { tenantId, role: 'DJ' },
        select: { id: true, email: true, createdAt: true }
      });
      res.json({ ok: true, data: djs });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async deleteDj(req, res, prisma) {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = DjController;
