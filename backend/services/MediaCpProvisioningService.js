const prisma = require('../lib/prisma');
const MediaCPRestClient = require('../lib/mediacp-rest');
const crypto = require('crypto');

class MediaCpProvisioningService {
  /**
   * Provision a service for a given tenant and plan
   */
  static async provisionService(tenantId, planId, provisioningJobId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!tenant || !plan) {
      throw new Error(`Tenant or Plan not found (tenant: ${tenantId}, plan: ${planId})`);
    }

    // 1. Fetch Global Config from environment variables
    const rpcUrl = process.env.MEDIACP_API_URL;
    const apiKey = process.env.MEDIACP_API_KEY;

    if (!rpcUrl || !apiKey) {
      throw new Error("Super Admin MediaCP API credentials not configured in System Setup. Cannot auto-provision.");
    }

    const client = new MediaCPRestClient(rpcUrl, apiKey);

    // 2. Resolve or Create MediaCpAccount for the tenant
    let mcpAccount = await prisma.mediaCpAccount.findFirst({
      where: { tenantId }
    });

    const safeTenantName = tenant.name.replace(/\s+/g, '').toLowerCase();

    if (!mcpAccount) {
      // Create account locally first
      mcpAccount = await prisma.mediaCpAccount.create({
        data: {
          tenantId,
          email: `admin@${safeTenantName}.local`,
          password: crypto.randomBytes(4).toString('hex'),
          status: 'active'
        }
      });
      // In a more advanced implementation, we might create a real customer account on MediaCP if supported.
      // Currently, MediaCP handles customers mostly per service or via specific endpoints.
    }

    // 3. Construct Payload
    const domain = `${safeTenantName}-${Date.now()}.local`;
    const password = crypto.randomBytes(4).toString('hex');
    
    let payload = {
      domain,
      email: mcpAccount.email,
      password: password
    };

    const planFeatures = plan.features || {};

    if (plan.type === 'RADIO' || plan.type === 'FULL' || plan.type === 'STREAMING') {
      payload.type = 'icecast2'; // Default radio type
      payload.max_listeners = planFeatures.maxListeners || 100;
      payload.max_bitrate = planFeatures.maxBitrate || 128;
      payload.autodj = planFeatures.autodj || 1;
    } else if (plan.type === 'TV') {
      payload.type = 'flussonic';
      payload.max_listeners = planFeatures.maxListeners || 50;
      payload.max_bitrate = planFeatures.maxBitrate || 1500;
    }

    // 4. Send Provisioning Request
    await this.logApiCall(provisioningJobId, 'POST', '/api/v2/services', payload);
    
    let response;
    try {
      response = await client.provisionService(payload);
      await this.logApiCall(provisioningJobId, 'POST', '/api/v2/services', payload, response, 200);
    } catch (apiError) {
      await this.logApiCall(provisioningJobId, 'POST', '/api/v2/services', payload, { error: apiError.message }, 500, true);
      throw apiError;
    }

    const newServiceId = response.id || (response.service && response.service.id) || null;

    if (!newServiceId) {
      console.warn(`[MediaCP] Provisioning succeeded but no Service ID returned. Response:`, response);
    }

    // 5. Store MediaCpService
    const mcpService = await prisma.mediaCpService.create({
      data: {
        tenantId,
        accountId: mcpAccount.id,
        serviceId: newServiceId ? String(newServiceId) : null,
        type: payload.type,
        domain: payload.domain,
        streamPassword: payload.password,
        status: 'active'
      }
    });

    // 6. Update Tenant Config (Legacy support)
    const tenantMcpConfig = {
      rpcUrl,
      apiKey,
    };
    if (plan.type === 'TV') {
      tenantMcpConfig.tvServerId = newServiceId;
    } else {
      tenantMcpConfig.serverId = newServiceId;
    }

    await prisma.config.upsert({
      where: { tenantId_key: { tenantId, key: 'mediacp' } },
      update: { value: tenantMcpConfig },
      create: { tenantId, key: 'mediacp', value: tenantMcpConfig }
    });

    return mcpService;
  }

  static async logApiCall(tenantId, method, endpoint, request, response = null, statusCode = null, isError = false) {
    try {
      await prisma.mediaCpApiLog.create({
        data: {
          tenantId: tenantId && tenantId.length > 0 ? tenantId : null,
          method,
          endpoint,
          request,
          response,
          statusCode,
          isError
        }
      });
    } catch (err) {
      console.error('[MediaCP Log Error]', err);
    }
  }
}

module.exports = MediaCpProvisioningService;
