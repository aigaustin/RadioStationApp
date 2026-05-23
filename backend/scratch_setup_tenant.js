const prisma = require('./lib/prisma');
const MediaCpService = require('./services/MediaCpService');

async function main() {
  const t = await prisma.tenant.findFirst({
    where: { name: 'Test Tenant with Radio API' }
  });
  if (!t) return console.log('Tenant not found');

  const cfg = {
    mediacp: {
      rpcUrl: 'https://cp.streamo.ng:2020',
      apiUrl: 'https://cp.streamo.ng:2020',
      apiKey: 'hsqEeaqkW5mbWcldf6ql0oh3sHlmnIddmJ-5X5aoiM-YqHqX0XeDlA==',
      serverId: 1, // hardcoding to 1 since we saw it in raw fetch
      tvServerId: 0
    }
  };

  await prisma.config.upsert({
    where: { tenantId_key: { tenantId: t.id, key: 'global' } },
    update: { value: cfg },
    create: { tenantId: t.id, key: 'global', value: cfg }
  });
  console.log('Saved tenant config with serverId 1');

  // Test the full getCredentials pull
  const creds = await MediaCpService.getCredentials(t.id);
  console.log('\n--- MediaCpService.getCredentials Output ---');
  console.log(JSON.stringify(creds, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
