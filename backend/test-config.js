const prisma = require('./lib/prisma');

(async () => {
  try {
    const configs = await prisma.config.findMany();
    console.log("Database configs:");
    console.log(JSON.stringify(configs, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
