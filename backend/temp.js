const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function run() {
  const users = await prisma.user.findMany({ where: { tenantId: null }});
  if (users.length > 0) {
    console.log('Super Admin exists:', users[0].email);
  } else {
    console.log('No Super Admin found. Creating one...');
    const email = 'admin@radiostation.app';
    const password = 'password123';
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin'
      }
    });
    console.log('Created super admin:', email, password);
  }
}
run().finally(() => prisma.$disconnect());
