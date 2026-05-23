const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

class AnalyticsController {
  
  static async getLogs(req, res) {
    try {
      const { containerId } = req.query; // Liquidsoap or Icecast container ID
      if (!containerId) return res.status(400).json({ ok: false, error: 'containerId required' });

      const container = docker.getContainer(containerId);
      const logs = await container.logs({ stdout: true, stderr: true, tail: 100 });
      
      res.json({ ok: true, data: logs.toString('utf-8') });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async getReporting(req, res, prisma) {
    try {
      // Stub for historical listener stats
      const stats = {
        currentListeners: Math.floor(Math.random() * 100),
        peakListeners: 150,
        totalListeningHours: 420.5,
        bandwidthUsageGb: 45.2, // Stub for bandwidth tracking (calculated from Icecast stats)
        storageUsageMb: 1250,   // Stub for disk storage usage in /uploads
        topCountries: [
          { country: 'US', count: 45 },
          { country: 'UK', count: 30 },
          { country: 'NG', count: 25 }
        ]
      };
      res.json({ ok: true, data: stats });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async getListenerMap(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      // In a real production app, we would parse Icecast JSON (/status-json.xsl)
      // to get listener IPs, and resolve them using a GeoIP database (like MaxMind).
      // Here is the mock data structure for the map:
      const listeners = [
        { ip: '102.69.x.x', lat: 9.0820, lng: 8.6753, city: 'Abuja', country: 'Nigeria' },
        { ip: '185.12.x.x', lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
        { ip: '104.28.x.x', lat: 40.7128, lng: -74.0060, city: 'New York', country: 'US' }
      ];
      
      res.json({ ok: true, data: listeners });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = AnalyticsController;
