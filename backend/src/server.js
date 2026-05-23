require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const ModuleRegistry = require('./core/ModuleRegistry');
const SetupController = require('./core/SetupController');
const AuthController = require('./core/AuthController');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

async function bootstrap() {
  try {
    // 1. Initialize Module Registry
    const registry = new ModuleRegistry(app, prisma);
    
    // 2. Load Modules from /src/modules/
    await registry.loadModules();
    
    // 3. Mount Routes
    registry.mountRoutes();
    
    // 4. Core setup check (First time setup wizard route)
    app.get('/api/setup/status', async (req, res) => {
      try {
        const superadmin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
        res.json({ ok: true, requiresSetup: !superadmin });
      } catch (e) {
        // If DB doesn't exist yet, it requires setup
        res.json({ ok: true, requiresSetup: true });
      }
    });

    app.post('/api/setup/complete', async (req, res) => SetupController.completeSetup(req, res, prisma));
    app.post('/api/auth/login', async (req, res) => AuthController.login(req, res, prisma));

    // 5. Bootstrap module background workers (e.g. Docker container orchestration)
    await registry.bootstrap();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`[Core] Streamo Core API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Core] Fatal error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
