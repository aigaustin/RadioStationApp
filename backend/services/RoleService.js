const prisma = require('../lib/prisma');
const { normalizePermissions } = require('../lib/permissions');
const { logActivity } = require('../lib/logger');

class RoleService {
  async listRoles(tenantId, isSuperAdmin) {
    const where = isSuperAdmin && !tenantId ? {} : { tenantId };
    return prisma.role.findMany({ where });
  }

  async createRole(data, tenantId, actorId, actorEmail, ipAddress) {
    if (!data.name) throw new Error('Missing role name');

    const existing = await prisma.role.findFirst({
      where: { name: data.name, tenantId: tenantId || null }
    });
    if (existing) throw new Error('Role name already exists');

    const role = await prisma.role.create({
      data: {
        name: data.name,
        permissions: normalizePermissions(data.permissions),
        tenantId: tenantId || null
      }
    });

    logActivity('role.create', { userId: actorId, email: actorEmail, details: `Created role ${data.name}`, ip: ipAddress });
    return role;
  }

  async updateRole(id, data, tenantId, isSuperAdmin, actorId, actorEmail, ipAddress) {
    const target = await prisma.role.findUnique({ where: { id } });
    if (!target) throw new Error('Not found');
    if (target.tenantId !== tenantId && !isSuperAdmin) throw new Error('Forbidden');

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (Array.isArray(data.permissions)) updateData.permissions = normalizePermissions(data.permissions);

    const updated = await prisma.role.update({
      where: { id },
      data: updateData
    });

    logActivity('role.update', { userId: actorId, email: actorEmail, details: `Updated role ${updated.name}`, ip: ipAddress });
    return updated;
  }

  async deleteRole(id, tenantId, isSuperAdmin, actorId, actorEmail, ipAddress) {
    const target = await prisma.role.findUnique({ where: { id } });
    if (!target) throw new Error('Not found');
    if (target.tenantId !== tenantId && !isSuperAdmin) throw new Error('Forbidden');
    if (target.name === 'Admin') throw new Error('Cannot delete Admin role');

    await prisma.role.delete({ where: { id } });

    logActivity('role.delete', { userId: actorId, email: actorEmail, details: `Deleted role ${target.name}`, ip: ipAddress });
  }
}

module.exports = new RoleService();
