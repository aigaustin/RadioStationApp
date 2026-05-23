const prisma = require('./prisma');
const MediaCPRestClient = require('./mediacp-rest');

async function provisionTenantService(tenantId, planId) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  if (!tenant || !plan) throw new Error("Tenant or Plan not found");

  // Fetch Global MediaCP Config (used by Super Admin to connect to MediaCP System API)
  const mcpConfigRecord = await prisma.config.findUnique({
    where: { tenantId_key: { tenantId: 'global', key: 'mediacp' } }
  });

  const globalMcpConfig = mcpConfigRecord ? mcpConfigRecord.value : null;
  if (!globalMcpConfig || !globalMcpConfig.rpcUrl || !globalMcpConfig.apiKey) {
    throw new Error("Super Admin MediaCP API credentials not configured. Cannot auto-provision.");
  }

  const client = new MediaCPRestClient(globalMcpConfig.rpcUrl, globalMcpConfig.apiKey);

  // Construct provisioning payload based on Plan Type
  let payload = {
    domain: `${tenant.name.replace(/\s+/g, '').toLowerCase()}-${Date.now()}.local`, // MediaCP requires a domain or identifier
    email: `admin@${tenant.name.replace(/\s+/g, '').toLowerCase()}.local`,
    password: Math.random().toString(36).slice(-8), // Generate random password
  };

  const planFeatures = plan.features || {};

  if (plan.type === 'RADIO' || plan.type === 'FULL' || plan.type === 'STREAMING') {
    payload.type = 'icecast2'; // Default radio type
    payload.max_listeners = planFeatures.maxListeners || 100;
    payload.max_bitrate = planFeatures.maxBitrate || 128;
    payload.autodj = planFeatures.autodj || 1;
  } else if (plan.type === 'TV') {
    payload.type = 'flussonic'; // Or standard TV type on MediaCP
    payload.max_listeners = planFeatures.maxListeners || 50;
    payload.max_bitrate = planFeatures.maxBitrate || 1500;
  }

  try {
    // 1. Call MediaCP Provisioning API
    const response = await client.provisionService(payload);
    
    // Assuming response contains the newly created service ID (e.g. response.service.id)
    // MediaCP response format varies, we will safely extract what we can
    const newServiceId = response.id || (response.service && response.service.id) || null;

    if (!newServiceId) {
      console.error("Provisioning succeeded but no Service ID returned", response);
    }

    // 2. Save the newly provisioned Service ID to the Tenant's config
    const tenantMcpConfig = {
      rpcUrl: globalMcpConfig.rpcUrl, // Inherit URL
      apiKey: globalMcpConfig.apiKey, // Inherit API key, or use reseller key if supported
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

    // 3. Send Onboarding Email
    try {
      const owner = await prisma.user.findFirst({ where: { tenantId, role: { name: 'Owner' } } }) || await prisma.user.findFirst({ where: { tenantId } });
      const globalSmtpRecord = await prisma.config.findUnique({ where: { tenantId_key: { tenantId: 'global', key: 'smtp' } } });
      const smtpConfig = globalSmtpRecord ? globalSmtpRecord.value : null;

      if (owner) {
        const { sendEmail } = require('./email');
        await sendEmail(smtpConfig, {
          to: owner.email,
          subject: 'Your New Service is Ready!',
          text: `Hello ${owner.firstName || ''},\n\nYour new ${plan.type} service has been successfully provisioned.\nYour service domain: ${payload.domain}\nStreaming password: ${payload.password}\n\nLogin to the dashboard to manage your service.\n\nThank you!`
        });
      }
    } catch (emailErr) {
      console.error("Failed to send onboarding email:", emailErr);
    }

    return { success: true, serviceId: newServiceId, response };

  } catch (err) {
    console.error("Auto-Provisioning Error:", err);
    throw err;
  }
}

module.exports = {
  provisionTenantService
};
