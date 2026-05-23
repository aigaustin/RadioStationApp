const bcrypt = require('bcryptjs');

class SetupController {
  
  static async completeSetup(req, res, prisma) {
    try {
      const { email, password, platformName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Email and password required' });
      }

      // Check if setup is already complete
      const existingAdmin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
      if (existingAdmin) {
        return res.status(403).json({ ok: false, error: 'Setup has already been completed.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      const tenant = await prisma.tenant.create({
        data: {
          name: platformName || 'Default Platform',
          slug: 'default'
        }
      });

      const admin = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'SUPERADMIN',
          tenantId: tenant.id
        }
      });

      const radioStation = await prisma.radioStation.create({
        data: {
          tenantId: tenant.id,
          name: 'Main Stream',
          mountPoint: '/live',
          port: 8000
        }
      });

      // Optionally save platformName in a global settings table
      // For now, returning success
      res.json({ 
        ok: true, 
        message: 'First-time setup complete. You can now log into Streamo Core.',
        data: { adminId: admin.id }
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = SetupController;
