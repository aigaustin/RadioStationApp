const request = require('supertest');
const express = require('express');
const mobileRouter = require('../routes/mobile');
const prisma = require('../lib/prisma');

const app = express();
app.use(express.json());
app.use('/api/mobile/v1', mobileRouter);

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  tenant: {
    findFirst: jest.fn(),
    findUnique: jest.fn()
  },
  appProfile: { findUnique: jest.fn() },
  appBranding: { findUnique: jest.fn() },
  appContactProfile: { findUnique: jest.fn() },
  appSocialLinks: { findUnique: jest.fn() },
  appFeatureFlag: { findUnique: jest.fn() },
  mediaCpService: { findMany: jest.fn() }
}));

describe('Mobile API GET /api/mobile/v1/:tenantSlug/config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if tenant not found', async () => {
    prisma.tenant.findFirst.mockResolvedValue(null);
    prisma.tenant.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/mobile/v1/invalid-slug/config');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  it('should return mobile configuration if tenant exists', async () => {
    const mockTenant = { id: 't1', name: 'my-radio' };
    prisma.tenant.findFirst.mockResolvedValue(mockTenant);
    
    prisma.appProfile.findUnique.mockResolvedValue({ name: 'My Radio App', maintenance: false });
    prisma.appBranding.findUnique.mockResolvedValue({ theme: 'dark', primaryColor: '#ff0000' });
    prisma.appContactProfile.findUnique.mockResolvedValue({ email: 'support@myradio.com' });
    prisma.appSocialLinks.findUnique.mockResolvedValue({});
    prisma.appFeatureFlag.findUnique.mockResolvedValue({ enableChat: true });
    prisma.mediaCpService.findMany.mockResolvedValue([{ type: 'icecast2', domain: 'stream.myradio.com' }]);

    const res = await request(app).get('/api/mobile/v1/my-radio/config');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.app.name).toBe('My Radio App');
    expect(res.body.data.branding.theme).toBe('dark');
    expect(res.body.data.contact.email).toBe('support@myradio.com');
    expect(res.body.data.features.enableChat).toBe(true);
    expect(res.body.data.streams[0].domain).toBe('stream.myradio.com');
  });
});
