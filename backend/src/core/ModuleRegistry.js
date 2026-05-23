const fs = require('fs');
const path = require('path');
const express = require('express');

class ModuleRegistry {
  constructor(app, prisma) {
    this.app = app;
    this.prisma = prisma;
    this.modules = new Map();
  }

  // Scans the modules directory and loads each module's index.js
  async loadModules() {
    console.log('[Core] Scanning for modules...');
    const modulesPath = path.join(__dirname, '../modules');
    if (!fs.existsSync(modulesPath)) return;

    const directories = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const dir of directories) {
      const modulePath = path.join(modulesPath, dir, 'index.js');
      if (fs.existsSync(modulePath)) {
        try {
          const mod = require(modulePath);
          if (mod.id) {
            this.modules.set(mod.id, mod);
            console.log(`[Core] Loaded module: ${mod.name} (${mod.id})`);
          } else {
            console.warn(`[Core] Invalid module in ${dir} (missing id or init)`);
          }
        } catch (e) {
          console.error(`[Core] Failed to load module ${dir}:`, e);
        }
      }
    }
  }

  // Mounts the API routes for active modules
  mountRoutes() {
    const apiRouter = express.Router();

    for (const [id, mod] of this.modules) {
      if (mod.routes) {
        // e.g. /api/modules/radio
        apiRouter.use(`/${id}`, mod.routes(this.prisma));
        console.log(`[Core] Mounted routes for module: ${id} at /api/modules/${id}`);
      }
    }

    this.app.use('/api/modules', apiRouter);
  }

  // Bootstraps modules (e.g. starting background workers, checking docker containers)
  async bootstrap() {
    for (const [id, mod] of this.modules) {
      if (typeof mod.bootstrap === 'function') {
        console.log(`[Core] Bootstrapping module: ${id}...`);
        await mod.bootstrap(this.prisma);
      }
    }
  }
}

module.exports = ModuleRegistry;
