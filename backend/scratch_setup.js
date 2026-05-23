const prisma = require('./lib/prisma');

async function main() {
  const doc = await prisma.config.findUnique({
    where: { tenantId_key: { tenantId: 'global', key: 'global' } }
  });
  
  const cfg = doc ? doc.value : {};
  cfg.mediacp = {
    ...cfg.mediacp,
    rpcUrl: 'https://cp.streamo.ng:2020',
    apiUrl: 'https://cp.streamo.ng:2020',
    apiKey: 'g5-Io3vVWpvOV5SHr3_QqVmp33eYmldWm9OIWcZ4iJybpqeazqq1mw==',
    serverId: 237, // Try setting actual demo service if they have one, fallback 1
    tvServerId: 2
  };

  await prisma.config.upsert({
    where: { tenantId_key: { tenantId: 'global', key: 'global' } },
    update: { value: cfg },
    create: { tenantId: 'global', key: 'global', value: cfg }
  });

  console.log('Global MediaCP config updated');
}

main().catch(console.error).finally(() => prisma.$disconnect());
