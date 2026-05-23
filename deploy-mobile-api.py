import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    code = """const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/mobile/v1/:tenantSlug/config
router.get('/:tenantSlug/config', async (req, res) => {
  try {
    // Just fetch the first tenant as the active customer (Andre)
    const tenant = await prisma.tenant.findFirst({
       orderBy: { createdAt: 'asc' }
    });

    if (!tenant) {
      return res.status(404).json({ ok: false, error: 'Tenant not found' });
    }

    const tenantId = tenant.id;

    // Fetch the flat config from Config table
    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId, key: 'global' } } });
    const cfg = configDoc ? configDoc.value : {};
    
    // Strip out mediacp secrets
    const { mediacp, ...publicCfg } = cfg;

    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, data: publicCfg });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
"""

    sftp = client.open_sftp()
    with open('mobile.js', 'w', encoding='utf-8') as f:
        f.write(code)
    sftp.put('mobile.js', '/home/media/mobile.js')
    sftp.close()
    
    commands = [
        "echo '2014@@Clonii' | sudo -S docker cp /home/media/mobile.js streamo_app:/app/backend/routes/mobile.js",
        "echo '2014@@Clonii' | sudo -S docker compose -f /opt/deploy/docker-compose.yml restart app"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        out = stdout.read().decode('utf-8', errors='ignore')
        print(out.encode('ascii', errors='replace').decode('ascii'))

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
