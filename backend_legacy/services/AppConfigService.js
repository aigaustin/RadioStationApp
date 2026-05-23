const prisma = require('../lib/prisma');
const StorageService = require('../lib/storage');

class AppConfigService {
  async getConfig(tenantId) {
    const profile = await prisma.appProfile.findUnique({ where: { tenantId } }) || {};
    const branding = await prisma.appBranding.findUnique({ where: { tenantId } }) || {};
    const contact = await prisma.appContactProfile.findUnique({ where: { tenantId } }) || {};
    const social = await prisma.appSocialLinks.findUnique({ where: { tenantId } }) || {};
    const features = await prisma.appFeatureFlag.findUnique({ where: { tenantId } }) || {};
    
    return { profile, branding, contact, social, features };
  }

  async updateProfile(tenantId, data) {
    return prisma.appProfile.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data }
    });
  }

  async updateBranding(tenantId, data) {
    return prisma.appBranding.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data }
    });
  }

  async updateContact(tenantId, data) {
    return prisma.appContactProfile.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data }
    });
  }

  async updateSocial(tenantId, data) {
    return prisma.appSocialLinks.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data }
    });
  }

  async uploadFile(buffer, originalName, mimeType) {
    return StorageService.uploadFile(buffer, originalName, mimeType);
  }
}

module.exports = new AppConfigService();
