const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');

async function createTenantAdmin() {
  const t = await prisma.tenant.findFirst({
    where: { name: 'Test Tenant with Radio API' }
  });
  if (!t) return console.log('Tenant not found');

  // Create or find an admin role for this tenant
  let role = await prisma.role.findFirst({
    where: { tenantId: t.id, name: 'Admin' }
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: 'Admin',
        tenantId: t.id,
        permissions: [
          'dashboard:read', 'stream:read', 'stream:write', 'tv:read', 'tv:write',
          'podcasts:read', 'podcasts:write', 'push:read', 'push:write',
          'contact:read', 'contact:write', 'config:read', 'config:write',
          'users:read', 'users:write', 'roles:read', 'roles:write',
          'invites:read', 'invites:write', 'activity:read', 'billing:read'
        ]
      }
    });
  }

  const email = 'admin@testradio.com';
  const password = 'Password123!';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.user.delete({ where: { email } });
  }

  const user = await prisma.user.create({
    data: {
      email,
      firstName: 'Radio',
      lastName: 'Admin',
      passwordHash: bcrypt.hashSync(password, 10),
      tenantId: t.id,
      roleId: role.id
    }
  });

  console.log(`User created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Tenant: ${t.name}`);
}

createTenantAdmin().catch(console.error).finally(() => prisma.$disconnect());
