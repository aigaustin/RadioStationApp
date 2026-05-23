const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { logActivity } = require('../lib/logger');

class UserService {
  async listUsers(tenantId, isSuperAdmin) {
    const where = isSuperAdmin && !tenantId ? {} : { tenantId };
    return prisma.user.findMany({
      where,
      include: { role: true, tenant: true }
    });
  }

  async updateProfile(userId, email, ipAddress, data) {
    const updateData = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl;
    if (data.company) updateData.company = data.company;
    if (data.timezone) updateData.timezone = data.timezone;

    if (data.password) {
      if (data.password.length < 6) throw new Error('Password too short');
      updateData.passwordHash = bcrypt.hashSync(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    logActivity('profile.update', { userId, email, details: 'Updated own profile', ip: ipAddress });
    return updated;
  }

  async createUser(data, tenantId, isSuperAdmin, creatorId, creatorEmail, ipAddress) {
    if (!data.email || !data.password) throw new Error('Missing email/password');
    if (data.password.length < 6) throw new Error('Password too short');

    let finalRoleId = null;
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) throw new Error('Invalid role');
      if (role.tenantId !== tenantId && !isSuperAdmin) throw new Error('Forbidden role assignment');
      finalRoleId = role.id;
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('User exists');

    const passwordHash = bcrypt.hashSync(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        roleId: finalRoleId,
        tenantId
      }
    });

    logActivity('user.create', { userId: creatorId, email: creatorEmail, details: `Created user ${data.email}`, ip: ipAddress });
    return user;
  }

  async updateUser(targetId, data, tenantId, isSuperAdmin, actorId, actorEmail, ipAddress) {
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new Error('Not found');
    if (target.tenantId !== tenantId && !isSuperAdmin) {
      throw new Error('Forbidden');
    }

    const updateData = {};
    if (typeof data.disabled === 'boolean') updateData.disabled = data.disabled;
    
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (role) {
        if (role.tenantId !== tenantId && !isSuperAdmin) throw new Error('Forbidden role assignment');
        updateData.roleId = role.id;
      }
    }
    
    if (data.password) {
      if (data.password.length < 6) throw new Error('Password too short');
      updateData.passwordHash = bcrypt.hashSync(data.password, 10);
    }

    const updated = await prisma.user.update({ where: { id: targetId }, data: updateData });

    logActivity('user.update', { userId: actorId, email: actorEmail, details: `Updated user ${target.email}`, ip: ipAddress });
    return updated;
  }

  async deleteUser(targetId, tenantId, isSuperAdmin, actorId, actorEmail, ipAddress) {
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new Error('Not found');
    if (target.tenantId !== tenantId && !isSuperAdmin) {
      throw new Error('Forbidden');
    }

    await prisma.user.delete({ where: { id: targetId } });

    logActivity('user.delete', { userId: actorId, email: actorEmail, details: `Deleted user ${target.email}`, ip: ipAddress });
  }
}

module.exports = new UserService();
