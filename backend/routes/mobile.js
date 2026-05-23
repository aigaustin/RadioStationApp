const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Public Mobile Runtime API
// Uses Tenant Slug to fetch configuration.

// Helper to get Tenant by Slug (We map the safe name as slug for now, or just use name match)
// Ideally, Tenant model should have a unique 'slug' field. For now, we search by name.
async function getTenantBySlug(slug) {
  // Try exactly matching name first (case insensitive if posgres, but prisma findFirst handles exact match)
  const tenant = await prisma.tenant.findFirst({
    where: {
      name: {
        equals: slug,
        mode: 'insensitive' // PostgreSQL only, but standard in Prisma
      }
    }
  });
  return tenant;
}

// GET /api/mobile/v1/:tenantSlug/config
router.get('/:tenantSlug/config', async (req, res) => {
  try {
    const { tenantSlug } = req.params;
    
    // In a real app, 'slug' should be an exact match field on Tenant. We approximate it:
    let tenant = await prisma.tenant.findFirst({ where: { name: { equals: tenantSlug, mode: 'insensitive' } } });
    
    // Fallback: search by id just in case someone passes an id instead of a slug
    if (!tenant) {
      tenant = await prisma.tenant.findUnique({ where: { id: tenantSlug } });
    }

    if (!tenant) {
      return res.status(404).json({ ok: false, error: 'Tenant not found' });
    }

    const tenantId = tenant.id;

    // Fetch all related configurations
    const profile = await prisma.appProfile.findUnique({ where: { tenantId } }) || {};
    const branding = await prisma.appBranding.findUnique({ where: { tenantId } }) || {};
    const contact = await prisma.appContactProfile.findUnique({ where: { tenantId } }) || {};
    const social = await prisma.appSocialLinks.findUnique({ where: { tenantId } }) || {};
    const features = await prisma.appFeatureFlag.findUnique({ where: { tenantId } }) || {};
    
    // Fetch Streaming URLs from MediaCpService
    const services = await prisma.mediaCpService.findMany({ where: { tenantId, status: 'active' } });
    const streams = services.map(s => ({
      type: s.type,
      domain: s.domain,
      url: `https://${s.domain}/stream` // Approximate format
    }));

    // Construct the combined config payload for Android app
    const configPayload = {
      app: {
        name: profile.name || tenant.name,
        description: profile.description,
        maintenance: profile.maintenance || false,
        minAppVersion: profile.minAppVersion,
        forceUpdate: profile.forceUpdate || false,
      },
      branding: {
        logoUrl: branding.logoUrl,
        splashUrl: branding.splashUrl,
        primaryColor: branding.primaryColor || '#000000',
        accentColor: branding.accentColor || '#ffffff',
        theme: branding.theme || 'light',
      },
      contact: {
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        whatsapp: contact.whatsapp,
        website: contact.website,
        privacyUrl: contact.privacyUrl,
        termsUrl: contact.termsUrl,
        supportUrl: contact.supportUrl,
      },
      social: {
        facebook: social.facebook,
        twitter: social.twitter,
        instagram: social.instagram,
        youtube: social.youtube,
      },
      features: {
        enableChat: features.enableChat || false,
        enablePodcasts: features.enablePodcasts || false,
        enableSchedule: features.enableSchedule || false,
      },
      streams
    };

    // Set cache headers (e.g. 5 minutes)
    res.setHeader('Cache-Control', `public, max-age=${process.env.MOBILE_CONFIG_CACHE_TTL || 300}`);
    res.json({ ok: true, data: configPayload });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
