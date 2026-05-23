const fetch = require('node-fetch');
const FormData = require('form-data');
const prisma = require('./prisma');
const fs = require('fs');

class MediaCPRestClient {
  constructor(apiUrl, apiKey, tenantId = null) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.tenantId = tenantId;
  }

  /**
   * Internal request handler that supports different body encodings and logs to Prisma.
   */
  async request(method, endpoint, data = null, bodyMode = 'json') {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
    };
    
    const options = { method, headers };
    
    if (data) {
      if (bodyMode === 'json') {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      } else if (bodyMode === 'urlencoded') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = new URLSearchParams(data).toString();
      } else if (bodyMode === 'formdata') {
        // Assume data is an object with a file stream and other fields
        const form = new FormData();
        for (const [key, value] of Object.entries(data)) {
          form.append(key, value);
        }
        options.body = form;
        // FormData automatically sets the Content-Type with the boundary
        Object.assign(headers, form.getHeaders());
      }
    }

    let result = null;
    let statusCode = null;
    let isError = false;
    let rawResponse = null;

    try {
      const response = await fetch(url, options);
      statusCode = response.status;
      rawResponse = await response.text();

      if (!response.ok) {
        throw new Error(`MediaCP API Error: ${response.status} ${response.statusText} - ${rawResponse}`);
      }
      
      try {
        result = JSON.parse(rawResponse);
      } catch(e) {
        result = rawResponse; // Sometimes APIs return plain text
      }
      
      return result;
    } catch (err) {
      isError = true;
      result = { error: true, message: err.message };
      return result;
    } finally {
      // Audit Logging to Prisma
      try {
        // Strip sensitive info from payload for logging
        let logRequest = data;
        if (bodyMode === 'formdata') logRequest = { _type: 'formdata', keys: Object.keys(data) };
        if (data && data.password) logRequest = { ...data, password: '***' };

        await prisma.mediaCpApiLog.create({
          data: {
            tenantId: this.tenantId,
            endpoint,
            method,
            request: logRequest || {},
            response: result || { raw: rawResponse },
            statusCode,
            isError
          }
        });
      } catch(logErr) {
        console.error('[MediaCP Audit Log Error]', logErr);
      }
    }
  }

  // ==========================================
  // SERVICE MANAGEMENT
  // ==========================================
  
  async listServices(userId = null, page = 1) {
    let q = `/api/0/media-service/list?page=${page}`;
    if (userId !== null) q += `&user_id=${userId}`;
    return this.request('GET', q);
  }

  async getService(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/show`);
  }

  async createService(serverId, payload) {
    // Note: The doc says /api/237/media-service/store but normally it's /api/0/media-service/store or similar?
    // Using serverId here to match the user's specific URL pattern /api/237/media-service/store
    return this.request('POST', `/api/${serverId}/media-service/store`, payload, 'urlencoded');
  }

  async updateServiceConfig(serverId, payload) {
    return this.request('POST', `/api/${serverId}/media-service/update`, payload, 'urlencoded');
  }

  async deleteService(serverId) {
    return this.request('DELETE', `/api/${serverId}/media-service/delete`);
  }

  // ==========================================
  // SERVICE CONTROLS
  // ==========================================

  async startService(serverId) {
    return this.request('POST', `/api/${serverId}/media-service/start-service`);
  }

  async stopService(serverId) {
    return this.request('POST', `/api/${serverId}/media-service/stop-service`);
  }

  async restartService(serverId) {
    return this.request('POST', `/api/${serverId}/media-service/restart-service`);
  }

  async kickSource(serverId) {
    return this.request('POST', `/api/${serverId}/media-service/kick`);
  }

  async suspendService(serverId, reason = 'suspended', days = 0) {
    return this.request('POST', `/api/${serverId}/media-service/suspend?reason=${encodeURIComponent(reason)}&days=${days}`);
  }

  async unsuspendService(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/unsuspend`);
  }

  async updateSongTitle(serverId, title) {
    return this.request('POST', `/api/${serverId}/media-service/update-song-title`, { title }, 'urlencoded');
  }

  // ==========================================
  // SERVICE STATS & HISTORY
  // ==========================================

  async getServiceStats(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/serviceInfo?extra=1`);
  }

  async getConnectionsList(serverId, page = 1) {
    return this.request('GET', `/api/${serverId}/media-service/connections?page=${page}`);
  }

  async getConnectionHistory(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/connectionHistory`);
  }

  async getBandwidthHistory(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/bandwidthHistory`);
  }

  async getTrackHistory(serverId, limit = 50) {
    return this.request('GET', `/api/${serverId}/media-service/trackHistory?limit=${limit}`);
  }

  // ==========================================
  // AUTODJ / SOURCE CONTROL
  // ==========================================

  async disconnectDj(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/disconnectDj`);
  }

  async startSource(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/startSource`);
  }

  async stopSource(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/stopSource`);
  }

  async restartSource(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/restartSource`);
  }

  async skipTrack(serverId) {
    return this.request('GET', `/api/${serverId}/media-service/skip-track`);
  }

  // ==========================================
  // AUTODJ / PLAYLIST TRACKS
  // ==========================================

  async listPlaylistTracks(serverId, playlistId, type = 'general') {
    return this.request('GET', `/api/${serverId}/playlist-track/list/${playlistId}?type=${type}`);
  }

  async updatePlaylistTracks(serverId, playlistId, type, payload) {
    return this.request('POST', `/api/${serverId}/playlist-track/update/${playlistId}?type=${type}`, payload, 'urlencoded');
  }

  // ==========================================
  // AUTODJ / MEDIA
  // ==========================================

  async listMedia(serverId, path = '/', page = 1, sort = 'title', direction = 'asc') {
    return this.request('GET', `/api/${serverId}/media/list?path=${encodeURIComponent(path)}&page=${page}&sort=${sort}&direction=${direction}`);
  }

  async uploadMedia(serverId, filePath, fileName) {
    const data = {
      file: fs.createReadStream(filePath),
      filename: fileName
    };
    return this.request('POST', `/api/${serverId}/media/upload`, data, 'formdata');
  }

  async updateMediaTrack(serverId, payload) {
    return this.request('POST', `/api/${serverId}/media/updateTrack`, payload, 'urlencoded');
  }

  async createFolder(serverId, path, title) {
    return this.request('GET', `/api/${serverId}/media/createFolder?title=${encodeURIComponent(title)}&path=${encodeURIComponent(path)}`);
  }

  async renameFolder(serverId, path, newTitle) {
    return this.request('GET', `/api/${serverId}/media/renameFolder?path=${encodeURIComponent(path)}&title=${encodeURIComponent(newTitle)}`);
  }

  async moveMedia(serverId, trackIds, moveToPath) {
    let qs = `moveToPath=${encodeURIComponent(moveToPath)}`;
    trackIds.forEach((id, index) => {
      qs += `&tracks[${index}]=${id}`;
    });
    return this.request('GET', `/api/${serverId}/media/renameFolder?${qs}`); // Note: API says renameFolder but it's used for move
  }

  async deleteMedia(serverId, trackIds) {
    let qs = '';
    trackIds.forEach((id, index) => {
      qs += `${index===0?'?':'&'}tracks[${index}]=${id}`;
    });
    return this.request('DELETE', `/api/${serverId}/media/delete${qs}`);
  }

  // ==========================================
  // AUTODJ / PLAYLIST & JINGLE
  // ==========================================

  async listPlaylists(serverId, page = 1, sort = 'title', direction = 'asc') {
    return this.request('GET', `/api/${serverId}/audio-playlist/list?page=${page}&sort=${sort}&direction=${direction}`);
  }

  async createPlaylist(serverId, payload) {
    return this.request('POST', `/api/${serverId}/audio-playlist/create`, payload, 'urlencoded');
  }

  async duplicatePlaylist(serverId, playlistId, payload) {
    return this.request('POST', `/api/${serverId}/audio-playlist/copy/${playlistId}`, payload, 'urlencoded');
  }

  async showPlaylist(serverId, playlistId) {
    return this.request('POST', `/api/${serverId}/audio-playlist/show/${playlistId}`, {}, 'urlencoded');
  }

  async deletePlaylist(serverId, playlistId) {
    return this.request('DELETE', `/api/${serverId}/audio-playlist/delete/${playlistId}`, {}, 'urlencoded');
  }

  async createJingle(serverId, payload) {
    return this.request('POST', `/api/${serverId}/jingle/create`, payload, 'urlencoded');
  }

  async duplicateJingle(serverId, jingleId, payload) {
    return this.request('POST', `/api/${serverId}/jingle/copy/${jingleId}`, payload, 'urlencoded');
  }

  async deleteJingle(serverId, jingleId) {
    return this.request('DELETE', `/api/${serverId}/jingle/delete/${jingleId}`, {}, 'urlencoded');
  }

  // ==========================================
  // AUTODJ / EVENT / SCHEDULE
  // ==========================================

  async listEvents(serverId, start, end) {
    return this.request('GET', `/api/${serverId}/event/list?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  }

  async createEvent(serverId, payload) {
    return this.request('POST', `/api/${serverId}/event/create`, payload, 'urlencoded');
  }

  async duplicateEvent(serverId, eventId, payload) {
    return this.request('POST', `/api/${serverId}/event/copy/${eventId}`, payload, 'urlencoded');
  }

  async showEvent(serverId, eventId) {
    return this.request('POST', `/api/${serverId}/event/show/${eventId}`, {}, 'urlencoded');
  }

  async deleteEvent(serverId, eventId) {
    return this.request('DELETE', `/api/${serverId}/event/delete/${eventId}`, {}, 'urlencoded');
  }

  // ==========================================
  // VOD / PLAYLIST
  // ==========================================

  async listVodPlaylists(serverId) {
    return this.request('GET', `/api/${serverId}/ondemand-playlist/index`, {}, 'urlencoded');
  }

  async showVodPlaylist(serverId, playlistId) {
    return this.request('GET', `/api/${serverId}/ondemand-playlist/show/${playlistId}`, {}, 'urlencoded');
  }

  async getAvailableVodTracks(serverId, playlistId) {
    return this.request('GET', `/api/${serverId}/ondemand-playlist/availableTracks/${playlistId}`, {}, 'urlencoded');
  }

  async createVodPlaylist(serverId, payload) {
    return this.request('POST', `/api/${serverId}/ondemand-playlist/store`, payload, 'urlencoded');
  }

  async updateVodPlaylist(serverId, playlistId, payload) {
    return this.request('POST', `/api/${serverId}/ondemand-playlist/update/${playlistId}`, payload, 'urlencoded');
  }

  async deleteVodPlaylist(serverId, playlistId) {
    return this.request('DELETE', `/api/${serverId}/ondemand-playlist/delete/${playlistId}`, {}, 'urlencoded');
  }

  // ==========================================
  // ADMIN / STATISTICS
  // ==========================================

  async getAdminStatistics() {
    return this.request('GET', `/api/0/Statistics`);
  }

  // ==========================================
  // STREAM TARGETS
  // ==========================================

  async listStreamTargets(serverId) {
    return this.request('GET', `/api/${serverId}/stream-targets/list`);
  }

  async showStreamTarget(serverId, targetId) {
    return this.request('GET', `/api/${serverId}/stream-targets/show/${targetId}`);
  }

  async getStreamTargetStatus(serverId, targetId) {
    return this.request('GET', `/api/${serverId}/stream-targets/status/${targetId}`);
  }

  async connectStreamTarget(serverId, targetId) {
    return this.request('PATCH', `/api/${serverId}/stream-targets/connect/${targetId}`);
  }

  async disconnectStreamTarget(serverId, targetId) {
    return this.request('PATCH', `/api/${serverId}/stream-targets/disconnect/${targetId}`);
  }

  async deleteStreamTarget(serverId, targetId) {
    return this.request('DELETE', `/api/${serverId}/stream-targets/delete/${targetId}`);
  }

  // ==========================================
  // DJS
  // ==========================================

  async listDjs(serverId) {
    return this.request('GET', `/api/${serverId}/dj/list`);
  }

  async showDj(serverId, djId) {
    return this.request('GET', `/api/${serverId}/dj/show/${djId}`);
  }

  async enableDj(serverId, djId) {
    return this.request('PATCH', `/api/${serverId}/dj/enable/${djId}`);
  }

  async disableDj(serverId, djId) {
    return this.request('PATCH', `/api/${serverId}/dj/disable/${djId}`);
  }

  async createDj(serverId, payload) {
    return this.request('POST', `/api/${serverId}/dj/store`, payload, 'urlencoded');
  }

  async updateDj(serverId, djId, payload) {
    return this.request('POST', `/api/${serverId}/dj/update/${djId}`, payload, 'urlencoded');
  }

  async deleteDj(serverId, djId) {
    return this.request('DELETE', `/api/${serverId}/dj/delete/${djId}`);
  }

  // ==========================================
  // USERS
  // ==========================================

  async listUsers(page = 1) {
    return this.request('GET', `/api/0/user/list?page=${page}`);
  }

  async showUser(userId) {
    return this.request('GET', `/api/0/user/show/${userId}`);
  }

  async createUser(payload) {
    return this.request('POST', `/api/0/user/store`, payload, 'urlencoded');
  }

  async deleteUser(userId) {
    return this.request('DELETE', `/api/0/user/delete/${userId}`);
  }

  // ==========================================
  // VIDEO MEDIA
  // ==========================================

  async listVideoMedia(serverId, page = 1) {
    return this.request('GET', `/api/${serverId}/video-media/list?page=${page}`);
  }

  async uploadVideoMedia(serverId, payload) {
    return this.request('POST', `/api/${serverId}/video-media/upload`, payload, 'urlencoded');
  }

  async deleteVideoMedia(serverId, filename) {
    return this.request('DELETE', `/api/${serverId}/video-media/delete?filename=${encodeURIComponent(filename)}`);
  }

  // ==========================================
  // STREAM EVENTS
  // ==========================================

  async listStreamEvents(startDate, endDate) {
    return this.request('GET', `/api/0/event-log/index?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
  }
}

module.exports = MediaCPRestClient;
