const prisma = require('./lib/prisma');

async function main() {
  const u = await prisma.user.findUnique({ where: { email: 'admin@testradio.com' } });
  if (!u) return console.log('User not found');
  
  const role = await prisma.role.findUnique({ where: { id: u.roleId } });
  if (!role) return console.log('Role not found');
  
  const p = new Set(role.permissions);
  p.add('mediacp:read');
  p.add('mediacp:write');
  
  await prisma.role.update({ 
    where: { id: role.id }, 
    data: { permissions: Array.from(p) } 
  });
  
  console.log('Fixed permissions');
}

main().catch(console.error).finally(() => prisma.$disconnect());
