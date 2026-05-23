const prisma = require('./lib/prisma');

async function check() {
  let t = await prisma.tenant.findUnique({ where: { id: 'global' } });
  if (!t) {
    t = await prisma.tenant.create({ data: { id: 'global', name: 'Global Platform' } });
    console.log('Created global tenant');
  } else {
    console.log('Global tenant exists');
  }
}

check().then(() => prisma.$disconnect()).catch(console.error);
