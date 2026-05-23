const prisma = require('./prisma');

/**
 * Log an activity entry.
 * @param {string} action — e.g. 'config.update', 'user.create', 'mediacp.restart'
 * @param {object} [meta] — optional metadata (userId, email, details, etc.)
 */
async function logActivity(action, meta = {}) {
  try {
    let tenantId = meta.tenantId;

    if (!tenantId && meta.userId) {
      const u = await prisma.user.findUnique({ where: { id: meta.userId }, select: { tenantId: true } });
      if (u) tenantId = u.tenantId;
    }

    await prisma.activityLog.create({
      data: {
        action,
        userId: meta.userId || null,
        details: meta.details || null,
        ip: meta.ip || null,
        tenantId: tenantId || null
      }
    });
  } catch (err) {
    process.stderr.write(`[error] Failed to log activity: ${err.message}\n`);
  }
}

/**
 * Read recent activity entries.
 */
async function getActivity(tenantId, limit = 50, offset = 0) {
  try {
    const where = tenantId ? { tenantId } : {};
    
    const [entries, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } }
      }),
      prisma.activityLog.count({ where })
    ]);

    return {
      entries: entries.map(e => ({
        id: e.id,
        action: e.action,
        userId: e.userId,
        email: e.user ? e.user.email : null,
        details: e.details,
        ip: e.ip,
        timestamp: e.createdAt.getTime(),
      })),
      total
    };
  } catch (err) {
    return { entries: [], total: 0 };
  }
}

module.exports = { logActivity, getActivity };
