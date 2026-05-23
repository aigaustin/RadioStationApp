const prisma = require('../lib/prisma');
const MediaCPRestClient = require('../lib/mediacp-rest');
const { logActivity } = require('../lib/logger');

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

class MediaCpService {
  async getMediacpConfig(tenantId) {
    const targetTenantId = tenantId || 'global';
    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId: targetTenantId, key: 'global' } } });
    const cfg = configDoc ? configDoc.value : {};
    const m = safeObject(cfg.mediacp) || {};

    let globalM = {};
    if (targetTenantId !== 'global') {
      const globalConfigDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId: 'global', key: 'global' } } });
      const globalCfg = globalConfigDoc ? globalConfigDoc.value : {};
      globalM = safeObject(globalCfg.mediacp) || {};
    }

    return {
      apiKey: m.apiKey || globalM.apiKey || process.env.MEDIACP_API_KEY || '',
      apiUrl: m.apiUrl || m.rpcUrl || globalM.apiUrl || globalM.rpcUrl || process.env.MEDIACP_API_URL || '',
      serverId: typeof m.serverId === 'number' && m.serverId > 0 ? m.serverId : (typeof globalM.serverId === 'number' ? globalM.serverId : (parseInt(m.serverId) || 0)),
      tvServerId: typeof m.tvServerId === 'number' && m.tvServerId > 0 ? m.tvServerId : (typeof globalM.tvServerId === 'number' ? globalM.tvServerId : (parseInt(m.tvServerId) || 0)),
    };
  }

  async getClient(tenantId, serviceType = 'radio') {
    const mc = await this.getMediacpConfig(tenantId);
    if (!mc.apiUrl || !mc.apiKey) {
      throw new Error('MediaCP API not configured');
    }
    const targetServerId = serviceType === 'tv' ? mc.tvServerId : mc.serverId;
    return { client: new MediaCPRestClient(mc.apiUrl, mc.apiKey), serverId: targetServerId };
  }

  async getStatus(tenantId, serviceType) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.getServiceStatus(serverId);
  }

  async getOverview(tenantId, serviceType) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    
    const service = await client.getService(serverId);
    
    // Fetch live stats from list endpoint since getService does not return them natively
    try {
      const list = await client.listServices(null);
      const liveStats = list.find(s => String(s.id) === String(serverId) || String(s.service_id) === String(serverId));
      if (liveStats && liveStats.stats) {
        service.stats = liveStats.stats;
      }
    } catch(e) {}
    
    // Fetch Recent Track History from public-json
    try {
      const fetch = require('node-fetch');
      const pubRes = await fetch(`${client.apiUrl}/public-json/${serverId}`);
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        if (pubData.trackhistory) {
          service.trackHistory = pubData.trackhistory;
        }
      }
    } catch(e) {}
    
    // Construct URLs using the MediaCP SSL Proxy route
    const apiUrl = client.apiUrl;
    const proxyDomain = new URL(apiUrl).hostname;
    const proxyPort = new URL(apiUrl).port || (apiUrl.startsWith('https') ? 443 : 80);
    const port = service.portbase || 8000;
    const scheme = apiUrl.startsWith('https://') ? 'https://' : 'http://';
    
    service.streamUrl = `${scheme}${proxyDomain}:${proxyPort}/${port}/stream`;
    service.publicPageUrl = `${apiUrl}/public/${service.slug || service.unique_id}`;
    
    return service;
  }

  async getCredentials(tenantId) {
    if (!tenantId) {
      return { account: null, services: [] };
    }

    const account = await prisma.mediaCpAccount.findFirst({
      where: { tenantId }
    });
    const services = await prisma.mediaCpService.findMany({
      where: { tenantId }
    });

    const mcpConfigRecord = await prisma.config.findUnique({
      where: { tenantId_key: { tenantId: tenantId, key: 'global' } }
    });
    const cfg = mcpConfigRecord ? mcpConfigRecord.value : {};
    const m = safeObject(cfg.mediacp) || {};
    
    // Also check global fallback if tenant doesn't have one
    const globalMcpConfigRecord = await prisma.config.findUnique({
      where: { tenantId_key: { tenantId: 'global', key: 'global' } }
    });
    const globalCfg = globalMcpConfigRecord ? globalMcpConfigRecord.value : {};
    const globalM = safeObject(globalCfg.mediacp) || {};

    const finalUrl = m.rpcUrl || m.apiUrl || globalM.rpcUrl || globalM.apiUrl || process.env.MEDIACP_API_URL || '';
    const finalApiKey = m.apiKey || globalM.apiKey || process.env.MEDIACP_API_KEY || '';
    const baseUrl = finalUrl.split('/api/')[0];

    let liveServices = services.map(s => ({
      id: s.id,
      serviceId: s.serviceId,
      type: s.type,
      domain: s.domain,
      streamPassword: s.streamPassword,
      status: s.status
    }));

    // If they have manually configured a server ID, fetch live details
    if (finalUrl && finalApiKey) {
      const client = new MediaCPRestClient(finalUrl, finalApiKey, tenantId);
      const radioId = typeof m.serverId === 'number' ? m.serverId : (parseInt(m.serverId) || 0);
      const tvId = typeof m.tvServerId === 'number' ? m.tvServerId : (parseInt(m.tvServerId) || 0);

      if (radioId > 0 && !liveServices.find(s => s.serviceId === radioId)) {
        try {
          const svc = await client.getService(radioId);
          if (svc && !svc.error) liveServices.push({ serviceId: radioId, type: 'radio', domain: svc.domain || svc.server_hostname || 'N/A', streamPassword: svc.password || '***', status: svc.state || svc.status || 'active' });
        } catch(e) {}
      }

      if (tvId > 0 && !liveServices.find(s => s.serviceId === tvId)) {
        try {
          const svc = await client.getService(tvId);
          if (svc && !svc.error) liveServices.push({ serviceId: tvId, type: 'tv', domain: svc.domain || svc.server_hostname || 'N/A', streamPassword: svc.password || '***', status: svc.state || svc.status || 'active' });
        } catch(e) {}
      }
    }

    return {
      account: account ? {
        email: account.email,
        password: account.password,
        status: account.status,
        loginUrl: baseUrl
      } : (finalUrl ? { email: 'Configured via API', password: '***', status: 'active', loginUrl: baseUrl } : null),
      services: liveServices
    };
  }

  async performAction(action, tenantId, serviceType, actorId, actorEmail, ipAddress) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');

    let result;
    const typeStr = serviceType || 'radio';
    switch (action) {
      case 'start': result = await client.startService(serverId); break;
      case 'stop': result = await client.stopService(serverId); break;
      case 'restart': result = await client.restartService(serverId); break;
      case 'kick-source': result = await client.kickSource(serverId); break;
      case 'autodj_start': result = await client.startAutoDj(serverId); break;
      case 'autodj_stop': result = await client.stopAutoDj(serverId); break;
      case 'autodj_status': return client.getAutoDjStatus(serverId);
      default: throw new Error('Unknown action');
    }

    if (action !== 'autodj_status') {
      logActivity(`mediacp.${action}.${typeStr}`, { userId: actorId, email: actorEmail, ip: ipAddress, tenantId });
    }
    return result;
  }

  async uploadMedia(tenantId, serviceType, filePath, originalName, actorId, actorEmail, ipAddress) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');

    const result = await client.uploadMedia(serverId, filePath, originalName);
    logActivity('mediacp.upload', { userId: actorId, email: actorEmail, ip: ipAddress, tenantId, details: originalName });
    return result;
  }

  async getWidgetSettings(tenantId) {
    const configDoc = await prisma.config.findUnique({
      where: { tenantId_key: { tenantId, key: 'mediacp_widgets' } }
    });
    return configDoc ? configDoc.value : { mapEmbedCode: '', chartEmbedCode: '' };
  }

  async saveWidgetSettings(tenantId, settings) {
    const value = {
      mapEmbedCode: settings.mapEmbedCode || '',
      chartEmbedCode: settings.chartEmbedCode || ''
    };
    
    await prisma.config.upsert({
      where: { tenantId_key: { tenantId, key: 'mediacp_widgets' } },
      update: { value },
      create: { tenantId, key: 'mediacp_widgets', value }
    });
    
    return value;
  }

  async listMedia(tenantId, serviceType, path = '/', page = 1) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.listMedia(serverId, path, page);
  }

  async createFolder(tenantId, serviceType, path, title) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.createFolder(serverId, path, title);
  }

  async deleteMedia(tenantId, serviceType, trackIds) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.deleteMedia(serverId, trackIds);
  }

  async listPlaylists(tenantId, serviceType, page = 1) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.listPlaylists(serverId, page);
  }

  async createPlaylist(tenantId, serviceType, payload) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.createPlaylist(serverId, payload);
  }

  async deletePlaylist(tenantId, serviceType, playlistId) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.deletePlaylist(serverId, playlistId);
  }

  async listEvents(tenantId, serviceType, start, end) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.listEvents(serverId, start, end);
  }

  async createEvent(tenantId, serviceType, payload) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.createEvent(serverId, payload);
  }

  async deleteEvent(tenantId, serviceType, eventId) {
    const { client, serverId } = await this.getClient(tenantId, serviceType);
    if (!serverId) throw new Error('Server ID not configured');
    return client.deleteEvent(serverId, eventId);
  }
}

module.exports = new MediaCpService();
