const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'streamo_core_super_secret_key_123';

class AuthController {
  static async login(req, res, prisma) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Email and password required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ ok: false, error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ ok: false, error: 'Invalid credentials' });
      }

      let defaultRadioStationId = 'default';
      if (user.tenantId) {
        const station = await prisma.radioStation.findFirst({ where: { tenantId: user.tenantId } });
        if (station) {
          defaultRadioStationId = station.id;
        }
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, tenantId: user.tenantId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        ok: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          radioStationId: defaultRadioStationId
        }
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = AuthController;
