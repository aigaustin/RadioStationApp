/* ── Renderers ── */
async function renderTab(key) {
  const c = $('content'); c.innerHTML = '';
  
  const skeletonTable = `<div class="table-wrap"><table><thead><tr><th>Loading</th><th>...</th></tr></thead><tbody><tr><td colspan="2"><div class="skeleton"></div></td></tr><tr><td colspan="2"><div class="skeleton"></div></td></tr></tbody></table></div>`;
  
  if (key === 'dashboard') {
    c.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card online"><div class="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="stat-content"><div class="stat-label">Stream Status</div><div class="stat-value" id="stStatus">...</div><div class="stat-meta">MediaCP</div></div></div>
        <div class="stat-card primary"><div class="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div><div class="stat-content"><div class="stat-label">Listeners</div><div class="stat-value" id="stListeners">0</div><div class="stat-meta">Active now</div></div></div>
        <div class="stat-card"><div class="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div><div class="stat-content"><div class="stat-label">Devices</div><div class="stat-value" id="stDevices">0</div><div class="stat-meta">Push registered</div></div></div>
        <div class="stat-card"><div class="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div class="stat-content"><div class="stat-label">Messages</div><div class="stat-value" id="stMessages">0</div><div class="stat-meta">Unread</div></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Now Playing</div></div>
        <div class="card-body">
          <div class="badge badge-info" id="npTitle" style="font-size:15px;padding:8px 16px;font-weight:700">Loading...</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Recent Activity</div></div>
        <div class="card-body p-0">
          <div class="table-wrap"><table><tbody id="dashAct"><tr><td colspan="3"><div class="skeleton"></div></td></tr></tbody></table></div>
        </div>
      </div>
    `;
    loadDashboardData();
  } else if (key === 'stream') {
    c.innerHTML = `
      <div class="stats-grid mcp-stats-grid">
        <div class="stat-card" id="mcpPlayerCard" style="display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="status-indicator" id="mcpLiveIndicator" style="width:10px;height:10px;border-radius:50%;background:var(--danger);box-shadow:0 0 8px var(--danger);"></div>
              <span style="font-weight:600;font-size:14px;letter-spacing:0.5px;">On Air</span>
            </div>
            <span class="badge badge-primary" style="font-size:10px;letter-spacing:1px;text-transform:uppercase;">Source: <span id="mcpSource">Loading</span></span>
          </div>
          <div class="now-playing-mcp" style="display:flex;align-items:center;gap:12px;background:var(--surface-active);padding:12px;border-radius:var(--radius);position:relative;z-index:1;">
            <div class="cover-art" style="width:48px;height:48px;border-radius:4px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;color:var(--primary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            </div>
            <div style="flex:1;overflow:hidden;">
              <div id="mcpNowPlaying" style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Loading stream...</div>
            </div>
            <button id="mcpPlayBtn" class="btn btn-primary" style="border-radius:50%;width:40px;height:40px;padding:0;display:flex;align-items:center;justify-content:center;" onclick="toggleMcpPlayer()">
              <svg id="mcpPlayIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
          </div>
          <audio id="mcpAudioElement" style="display:none;" preload="none"></audio>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:var(--primary-light);color:var(--primary);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
          <div class="stat-content">
            <div class="stat-label">Listeners</div>
            <div class="stat-value" id="mcpListeners">0 / 0</div>
            <div class="stat-meta">Active connections</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:var(--warning-light);color:var(--warning);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="stat-content">
            <div class="stat-label">Bandwidth</div>
            <div class="stat-value" id="mcpBandwidth">0 MB / 0 GB</div>
            <div class="stat-meta">Data transfer</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:var(--success-bg);color:var(--success);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <div class="stat-content">
            <div class="stat-label">Storage</div>
            <div class="stat-value" id="mcpStorage">0 GB / 0 GB</div>
            <div class="stat-meta">Disk usage</div>
          </div>
        </div>
      </div>
      
      <div class="mcp-widgets-grid" style="display:grid;grid-template-columns:1.5fr 2.5fr 1.5fr;gap:20px;margin-bottom:24px;">
        <div class="card" style="margin-bottom:0;">
          <div class="card-header"><div class="card-header-content"><div class="card-title">Recently Played</div></div></div>
          <div class="card-body p-0" style="max-height: 350px; overflow-y: auto;">
            <div id="mcpRecentTracks" style="display:flex;flex-direction:column;gap:0;">
              <div style="padding:16px;text-align:center;color:var(--text-tertiary);">Loading tracks...</div>
            </div>
          </div>
        </div>
        
        <div class="card" style="margin-bottom:0;">
          <div class="card-header"><div class="card-header-content"><div class="card-title">Listeners Map</div></div></div>
          <div class="card-body" style="display:flex;align-items:center;justify-content:center;height:350px;background:var(--surface-active);">
            <div style="text-align:center;color:var(--text-tertiary);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.5;"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/></svg>
              <p style="margin:0;font-size:14px;">Awaiting Map Widget Embed Code</p>
              <small style="opacity:0.7;">Requires MediaCP Iframe</small>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0;">
          <div class="card-header"><div class="card-header-content"><div class="card-title">Listeners (12 hrs)</div></div></div>
          <div class="card-body" style="display:flex;align-items:center;justify-content:center;height:350px;background:var(--surface-active);">
            <div style="text-align:center;color:var(--text-tertiary);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.5;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <p style="margin:0;font-size:14px;">Awaiting Chart Embed Code</p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="card" style="flex:2">
          <div class="card-header"><div class="card-header-content"><div class="card-title">Stream Credentials</div><div class="card-subtitle">Your MediaCP access details</div></div></div>
          <div class="card-body p-0" id="mcpCredentialsPanel">${skeletonTable}</div>
        </div>

        <div class="card" style="flex:1">
          <div class="card-header"><div class="card-header-content"><div class="card-title">Service Control</div><div class="card-subtitle">Manage streaming service state</div></div></div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
            <button class="btn btn-success" style="width:100%;justify-content:center" onclick="mcpAction('start')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Start Service</button>
            <button class="btn btn-danger" style="width:100%;justify-content:center" onclick="mcpAction('stop')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>Stop Service</button>
            <button class="btn btn-warning" style="width:100%;justify-content:center" onclick="mcpAction('restart')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>Restart</button>
            <button class="btn" style="width:100%;justify-content:center" onclick="mcpAction('kick-source')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>Kick Source</button>
            <a id="mcpPublicPageBtn" class="btn" style="width:100%;justify-content:center;display:none" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Public Page</a>
            <hr style="border:none;border-top:1px solid var(--border);margin:4px 0;">
            <button class="btn btn-secondary" style="width:100%;justify-content:center" onclick="openWidgetSettings()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>Widget Settings</button>
            <pre id="mcpRes" class="hide" style="margin-top:8px;background:var(--surface-active);padding:12px;border-radius:var(--radius);font-size:12px;overflow:auto;border:1px solid var(--border)"></pre>
          </div>
        </div>
      </div>
      
      <!-- Modal Container -->
      <div id="widgetSettingsModal" class="modal hide">
        <div class="modal-content" style="max-width:500px;">
          <div class="modal-header">
            <h2>Dashboard Embed Widgets</h2>
            <button class="modal-close" onclick="$('widgetSettingsModal').classList.add('hide')"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Map Widget HTML Embed Code</label>
              <textarea id="mapEmbedCodeInput" class="form-control" rows="4" placeholder="Paste <iframe> from Google Maps or analytics provider here"></textarea>
            </div>
            <div class="form-group">
              <label>Listeners Chart HTML Embed Code</label>
              <textarea id="chartEmbedCodeInput" class="form-control" rows="4" placeholder="Paste <iframe> from charting provider here"></textarea>
            </div>
          </div>
          <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:12px;padding-top:16px;">
            <button class="btn" onclick="$('widgetSettingsModal').classList.add('hide')">Cancel</button>
            <button class="btn btn-primary" onclick="saveWidgetSettings()">Save Changes</button>
          </div>
        </div>
      </div>
    `;
    loadMediaCPCredentials();
    loadMediaCpOverview();
    
    // Setup interval for stream polling
    if(window.mcpOverviewTimer) clearInterval(window.mcpOverviewTimer);
    window.mcpOverviewTimer = setInterval(() => {
      const isStreamActive = document.querySelector('.nav-item[data-tab="stream"]')?.classList.contains('active');
      if (isStreamActive) loadMediaCpOverview(true);
      else clearInterval(window.mcpOverviewTimer);
    }, 15000);
  } else if (key === 'tv') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-header-content"><div class="card-title">TV Station Control</div><div class="card-subtitle">Manage TV streaming service state</div></div></div>
        <div class="card-body">
          <div class="btn-group">
            <button class="btn btn-success" onclick="mcpAction('start', 'tv')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Start TV</button>
            <button class="btn btn-danger" onclick="mcpAction('stop', 'tv')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>Stop TV</button>
            <button class="btn btn-warning" onclick="mcpAction('restart', 'tv')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>Restart TV</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Media Manager (TV)</div></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Upload Video File</label><input type="file" id="tvUpload" class="form-input" accept="video/mp4,video/webm"/></div>
          <button class="btn btn-primary" onclick="uploadTvMedia()">Upload File</button>
        </div>
      </div>
    `;
  } else if (key === 'billing') {
    if (me && me.isSuperAdmin) {
      c.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon" style="background:var(--success-bg);color:var(--success)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div><div class="stat-content"><div class="stat-label">Total Revenue</div><div class="stat-value" id="bTotRev">NGN 0</div></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light);color:var(--primary)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div><div class="stat-content"><div class="stat-label">Active Subscriptions</div><div class="stat-value" id="bActSubs">0</div></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">All Subscriptions</div></div>
          <div class="card-body p-0" id="bAllSubsList">${skeletonTable}</div>
        </div>
      `;
      loadSuperAdminBilling();
    } else {
      c.innerHTML = `
        <div class="card">
          <div class="card-header"><div class="card-title">Available Plans</div></div>
          <div class="card-body p-0" id="bPlansList">${skeletonTable}</div>
          <div class="card-footer" style="justify-content:center;background:var(--gray-0);border-top:none;padding-top:0;">
            <div style="display:flex;align-items:center;gap:6px;color:var(--text-tertiary);font-size:12px;font-weight:500;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Payments secured by Stripe/Paystack. PCI-DSS Compliant.
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">My Subscriptions</div></div>
          <div class="card-body p-0" id="bSubsList">${skeletonTable}</div>
        </div>
      `;
      loadBilling();
    }
  } else if (key === 'provisioning') {
    c.innerHTML = `<div class="card"><div class="card-header"><div class="card-title">Provisioning Queue</div></div><div class="card-body p-0" id="provListWrap">${skeletonTable}</div></div>`;
    loadProvisioningJobs();
  } else if (key === 'plans') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Create New Plan</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Plan Name</label><input class="form-input" id="planName" placeholder="e.g. Pro TV"/></div>
            <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="planType"><option value="RADIO">Radio</option><option value="TV">TV</option><option value="STREAMING">Streaming</option><option value="FULL">Full</option></select></div>
            <div class="form-group"><label class="form-label">Price (NGN)</label><input type="number" class="form-input" id="planPrice" value="5000"/></div>
          </div>
          <button class="btn btn-primary" onclick="createPlan()">Create Plan</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">All Plans</div></div>
        <div class="card-body p-0" id="aPlansList">${skeletonTable}</div>
      </div>
    `;
    loadAdminPlans();
  } else if (key === 'setup') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">System Configuration (.env)</div></div>
        <div class="card-body">
          <p class="text-muted text-sm" style="margin-bottom: 16px;">These settings are applied globally and instantly update the server configuration.</p>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Paystack Public Key</label><input class="form-input" id="env_paystack_pub"/></div>
            <div class="form-group"><label class="form-label">Paystack Secret Key</label><input class="form-input" type="password" id="env_paystack_sec" placeholder="Leave blank to keep existing"/></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Flutterwave Public Key</label><input class="form-input" id="env_flw_pub"/></div>
            <div class="form-group"><label class="form-label">Flutterwave Secret Key</label><input class="form-input" type="password" id="env_flw_sec" placeholder="Leave blank to keep existing"/></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">MediaCP Global API URL</label><input class="form-input" id="env_mcp_url" placeholder="https://media.yourdomain.com:2020"/></div>
            <div class="form-group"><label class="form-label">MediaCP Global API Key</label><input class="form-input" type="password" id="env_mcp_key" placeholder="Leave blank to keep existing"/></div>
          </div>
          <button class="btn btn-primary" onclick="saveSystemSetup()">Save Configuration</button>
        </div>
      </div>
    `;
    loadSystemSetup();
  } else if (key === 'features') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Tenant Feature Toggles</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Select Tenant</label>
            <select class="form-select" id="tfTenantSel" onchange="loadTenantFeatures()"><option value="">-- Select Tenant --</option></select>
          </div>
          <div id="tfWrap" class="hide">
            <div class="form-group"><label class="perm-item"><input type="checkbox" id="tfPodcasts"/><span class="perm-name">Podcasts</span></label></div>
            <div class="form-group"><label class="perm-item"><input type="checkbox" id="tfSchedule"/><span class="perm-name">Schedule</span></label></div>
            <div class="form-group"><label class="perm-item"><input type="checkbox" id="tfNotifications"/><span class="perm-name">Push Notifications</span></label></div>
            <button class="btn btn-primary" onclick="saveTenantFeatures()">Save Features</button>
          </div>
        </div>
      </div>
    `;
    loadFeatureTenants();
  } else if (key === 'schedule') {
    c.innerHTML = `
      <div style="display:flex;gap:12px;margin-bottom:24px;">
        <button class="btn btn-primary" id="btnTabMedia" onclick="switchAutoDjTab('media')">Media Manager</button>
        <button class="btn" id="btnTabPlaylists" onclick="switchAutoDjTab('playlists')">Playlists</button>
        <button class="btn" id="btnTabSchedule" onclick="switchAutoDjTab('schedule')">Schedule</button>
      </div>

      <!-- Media Manager -->
      <div id="autodjMediaView">
        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
            <div class="card-title">Media Manager</div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm" onclick="mcpCreateFolderPrompt()">+ Folder</button>
              <button class="btn btn-sm btn-primary" onclick="$('mcpUploadInput').click()">Upload MP3</button>
              <input type="file" id="mcpUploadInput" accept="audio/mpeg,audio/mp3" style="display:none" onchange="handleMcpUpload(event)">
            </div>
          </div>
          <div class="card-body p-0">
            <div style="padding:12px 16px;background:var(--surface-active);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">
              <button class="btn btn-sm" onclick="mcpNavigateUp()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
              <span id="mcpCurrentPath" style="font-family:monospace;font-size:14px;background:var(--bg);padding:4px 8px;border-radius:4px;border:1px solid var(--border);">/</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Actions</th></tr></thead>
                <tbody id="mcpMediaList"><tr><td colspan="4"><div class="skeleton"></div></td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Playlists -->
      <div id="autodjPlaylistsView" class="hide">
        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
            <div class="card-title">AutoDJ Playlists</div>
            <button class="btn btn-sm btn-primary" onclick="mcpCreatePlaylistPrompt()">Create Playlist</button>
          </div>
          <div class="card-body p-0">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="mcpPlaylistList"><tr><td colspan="4"><div class="skeleton"></div></td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule -->
      <div id="autodjScheduleView" class="hide">
        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
            <div class="card-title">Schedule Events</div>
            <button class="btn btn-sm btn-primary" onclick="mcpCreateEventPrompt()">Schedule Playlist</button>
          </div>
          <div class="card-body p-0">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Event Name</th><th>Start Time</th><th>End Time</th><th>Actions</th></tr></thead>
                <tbody id="mcpScheduleList"><tr><td colspan="4"><div class="skeleton"></div></td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
    window.currentMcpPath = '/';
    loadMcpMedia();
  } else if (key === 'podcasts') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Add Podcast Episode</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="pTitle"/></div>
            <div class="form-group"><label class="form-label">Host</label><input class="form-input" id="pHost"/></div>
            <div class="form-group"><label class="form-label">Category</label><input class="form-input" id="pCat"/></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Audio URL</label><input class="form-input" id="pAudio"/></div>
            <div class="form-group"><label class="form-label">Artwork URL</label><input class="form-input" id="pArt"/></div>
          </div>
          <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="pDesc"></textarea></div>
        </div>
        <div class="card-footer"><button class="btn btn-primary" onclick="addPodcast()">Add Episode</button></div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">Episodes</div></div><div class="card-body p-0" id="pListWrap">${skeletonTable}</div></div>
    `;
    loadPodcasts();
  } else if (key === 'push') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-header-content"><div class="card-title">Send Broadcast</div><div class="card-subtitle">Deliver push notifications to all registered mobile devices</div></div></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Notification Title</label><input class="form-input" id="nTitle" placeholder="e.g. Breaking News"/></div>
          <div class="form-group"><label class="form-label">Message Body</label><textarea class="form-textarea" id="nBody" placeholder="Message content..."></textarea></div>
        </div>
        <div class="card-footer"><button class="btn btn-primary" onclick="sendPush()">Send Broadcast</button></div>
      </div>
    `;
  } else if (key === 'messages') {
    c.innerHTML = `<div class="card"><div class="card-header"><div class="card-title">Inbox</div></div><div class="card-body p-0" id="mListWrap">${skeletonTable}</div></div>`;
    loadMessages();
  } else if (key === 'general') {
    c.innerHTML = `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-meta"><h3>Station Details</h3><p>Core information about your station displayed publicly.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row"><div class="form-group"><label class="form-label">Station Name</label><input class="form-input" id="name"/></div><div class="form-group"><label class="form-label">Tagline</label><input class="form-input" id="tagline"/></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Website</label><input class="form-input" id="website"/></div><div class="form-group"><label class="form-label">Station ID</label><input class="form-input" id="stationId"/></div></div>
            <div class="form-group"><label class="form-label">About</label><textarea class="form-textarea" id="aboutText"></textarea></div>
            <div class="form-group"><label class="form-label">Footer Text</label><input class="form-input" id="footerText"/></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>Contact Information</h3><p>How listeners and partners can reach you.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="cEmail"/></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="cPhone"/></div><div class="form-group"><label class="form-label">WhatsApp</label><input class="form-input" id="cWhatsapp"/></div></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"></div>
          <div class="settings-content"><button class="btn btn-primary" onclick="saveGlobalConfig()">Save Configuration</button></div>
        </div>
      </div>
    `;
    fillForm(cfg);
  } else if (key === 'urls') {
    c.innerHTML = `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-meta"><h3>Stream Endpoints</h3><p>Configure the URLs for your live broadcast and metadata.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row"><div class="form-group"><label class="form-label">Stream URL</label><input class="form-input" id="streamUrl"/></div><div class="form-group"><label class="form-label">Now Playing URL</label><input class="form-input" id="nowPlayingUrl"/></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Schedule Events URL</label><input class="form-input" id="scheduleEventsUrl"/></div><div class="form-group"><label class="form-label">Schedule Week URL</label><input class="form-input" id="scheduleWeekUrl"/></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Listener Map URL</label><input class="form-input" id="listenerMapUrl"/></div><div class="form-group"><label class="form-label">Country Stats URL</label><input class="form-input" id="countryStatsUrl"/></div></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"></div>
          <div class="settings-content"><button class="btn btn-primary" onclick="saveGlobalConfig()">Save Configuration</button></div>
        </div>
      </div>
    `;
    fillForm(cfg);
  } else if (key === 'branding') {
    c.innerHTML = `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-meta"><h3>App Profile</h3><p>Basic information displayed in the Android App.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-group"><label class="form-label">App Name</label><input class="form-input" id="appName" placeholder="NovaRadio"/></div>
            <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="appDescription" placeholder="The best station in town."></textarea></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>App Assets</h3><p>Upload your logo and splash screens.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row"><div class="form-group"><label class="form-label">App Logo URL</label><input class="form-input" id="appLogoUrl"/></div><div class="form-group"><label class="form-label">App Splash URL</label><input class="form-input" id="appSplashUrl"/></div></div>
            <div class="form-group"><label class="form-label">Upload App Asset</label><input class="form-input" type="file" id="uploadFile" accept="image/png,image/jpeg,image/webp"/></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>Theme Colors</h3><p>Customize your application's primary and accent colors.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Primary Color</label><input class="form-input" type="color" id="appPrimaryColor" style="height:44px;padding:4px"/></div>
              <div class="form-group"><label class="form-label">Accent Color</label><input class="form-input" type="color" id="appAccentColor" style="height:44px;padding:4px"/></div>
            </div>
            <div class="form-group"><label class="form-label">Theme Mode</label><select class="form-select" id="appTheme"><option value="light">Light</option><option value="dark">Dark</option></select></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>Contact Info</h3><p>Support links shown to app users.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row"><div class="form-group"><label class="form-label">Support Email</label><input class="form-input" id="appContactEmail"/></div><div class="form-group"><label class="form-label">WhatsApp</label><input class="form-input" id="appContactWhatsapp"/></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Website</label><input class="form-input" id="appContactWebsite"/></div><div class="form-group"><label class="form-label">Support URL</label><input class="form-input" id="appContactSupportUrl"/></div></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>Social Links</h3><p>Connect your audience to your socials.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row"><div class="form-group"><label class="form-label">Facebook</label><input class="form-input" id="appSocialFacebook"/></div><div class="form-group"><label class="form-label">Twitter/X</label><input class="form-input" id="appSocialTwitter"/></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Instagram</label><input class="form-input" id="appSocialInstagram"/></div><div class="form-group"><label class="form-label">YouTube</label><input class="form-input" id="appSocialYoutube"/></div></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>Feature Flags</h3><p>Enable or disable major sections in the Android app.</p></div>
          <div class="settings-content card"><div class="card-body">
            <label class="form-group" style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="appFeatureChat"/> Enable In-App Chat</label>
            <label class="form-group" style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="appFeaturePodcasts"/> Enable Podcasts</label>
            <label class="form-group" style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="appFeatureSchedule"/> Enable Schedule</label>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"></div>
          <div class="settings-content"><button class="btn btn-primary" onclick="saveAppConfig()">Save Mobile Config</button></div>
        </div>
      </div>
    `;

    // Load App Config
    api('/api/appConfig').then(res => {
      if(res.ok && res.data) {
        const { profile, branding, contact, social, features } = res.data;
        if(profile) { $('appName').value = profile.name || ''; $('appDescription').value = profile.description || ''; }
        if(branding) { $('appLogoUrl').value = branding.logoUrl || ''; $('appSplashUrl').value = branding.splashUrl || ''; $('appPrimaryColor').value = branding.primaryColor || '#000000'; $('appAccentColor').value = branding.accentColor || '#ffffff'; $('appTheme').value = branding.theme || 'light'; }
        if(contact) { $('appContactEmail').value = contact.email || ''; $('appContactWhatsapp').value = contact.whatsapp || ''; $('appContactWebsite').value = contact.website || ''; $('appContactSupportUrl').value = contact.supportUrl || ''; }
        if(social) { $('appSocialFacebook').value = social.facebook || ''; $('appSocialTwitter').value = social.twitter || ''; $('appSocialInstagram').value = social.instagram || ''; $('appSocialYoutube').value = social.youtube || ''; }
        if(features) { $('appFeatureChat').checked = features.enableChat || false; $('appFeaturePodcasts').checked = features.enablePodcasts || false; $('appFeatureSchedule').checked = features.enableSchedule || false; }
      }
    });

    $('uploadFile').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { 
        const fd = new FormData(); fd.append('file', f); 
        const r = await fetch('/api/appConfig/upload', { method: 'POST', body: fd, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }); 
        const j = await r.json(); 
        if (!r.ok) throw new Error(j.error); 
        $('appLogoUrl').value = j.url; toast('Uploaded successfully'); 
      } catch (err) { toast(err.message, 'error'); } finally { $('uploadFile').value = ''; }
    });
  } else if (key === 'seo') {
    c.innerHTML = `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-meta"><h3>SEO Configuration</h3><p>Manage how your station appears in search engines.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-group"><label class="form-label">Meta Description</label><textarea class="form-textarea" id="seoDesc" placeholder="Brief description of the station..."></textarea></div>
            <div class="form-group"><label class="form-label">Meta Keywords</label><input class="form-input" id="seoKeywords" placeholder="radio, music, live, etc"/></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"><h3>Legal Pages</h3><p>Terms of Service and Privacy Policy contents.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-group"><label class="form-label">Terms of Service</label><textarea class="form-textarea" id="legalTerms"></textarea></div>
            <div class="form-group"><label class="form-label">Privacy Policy</label><textarea class="form-textarea" id="legalPrivacy"></textarea></div>
            <div class="form-group"><label class="form-label">Copyright Notice</label><input class="form-input" id="legalCopyright" placeholder="© 2026 Radio Station. All rights reserved."/></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"></div>
          <div class="settings-content"><button class="btn btn-primary" onclick="saveGlobalConfig()">Save Configuration</button></div>
        </div>
      </div>
    `;
    fillForm(cfg);
  } else if (key === 'adminBrand') {
    c.innerHTML = `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-meta"><h3>Platform Branding</h3><p>Customize the appearance of this backend console.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Dashboard Name</label><input class="form-input" id="adminName" placeholder="e.g. Studio Console"/></div>
              <div class="form-group"><label class="form-label">Admin Logo URL</label><input class="form-input" id="adminLogoUrl" placeholder="https://..."/></div>
            </div>
            <div class="form-group"><label class="form-label">Upload Admin Logo</label><input class="form-input" type="file" id="uploadAdminLogo" accept="image/png,image/jpeg,image/webp"/></div>
          </div></div>
        </div>
        <div class="settings-row">
          <div class="settings-meta"></div>
          <div class="settings-content"><button class="btn btn-primary" onclick="saveGlobalConfig()">Save Configuration</button></div>
        </div>
      </div>
    `;
    fillForm(cfg);
    $('uploadAdminLogo').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/uploads/image', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error); $('adminLogoUrl').value = j.url; toast('Uploaded successfully'); } catch (err) { toast(err.message, 'error'); } finally { $('uploadAdminLogo').value = ''; }
    });
  } else if (key === 'users') {
    const opts = roles.map(r => `<option value="${r.id}">${escHtml(r.name)}</option>`).join('');
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Invite / Create User</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="uEmail"/></div>
            <div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" id="uPass"/></div>
            <div class="form-group"><label class="form-label">Role</label><select class="form-select" id="uRole">${opts}</select></div>
          </div>
        </div>
        <div class="card-footer"><button class="btn btn-primary" onclick="addUser()">Create User</button></div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">User Directory</div></div><div class="card-body p-0" id="uListWrap">${skeletonTable}</div></div>
    `;
    renderUsers();
  } else if (key === 'roles') {
    c.innerHTML = `
      <div class="row" style="display:flex; gap:24px; align-items:flex-start;">
        <div class="card" style="flex: 1;">
          <div class="card-header"><div class="card-title">Roles Directory</div></div>
          <div class="card-body p-0" id="rListWrap">${skeletonTable}</div>
        </div>
        
        <div class="card" style="flex: 1.5;" id="roleEditCard">
          <div class="card-header">
            <div class="card-header-content">
              <div class="card-title" id="rEditTitle">Create New Role</div>
              <div class="card-subtitle">Define role details and permissions</div>
            </div>
          </div>
          <div class="card-body">
            <div class="form-group"><label class="form-label">Role Name</label><input class="form-input" id="rName" placeholder="e.g. Content Manager"/></div>
            <div class="form-group"><label class="form-label">Permissions</label><div class="perm-grid" id="pGrid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;"></div></div>
          </div>
          <div class="card-footer" style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn" onclick="newRole()">Cancel / Clear</button>
            <button class="btn btn-primary" onclick="saveRole()">Save Role</button>
          </div>
        </div>
      </div>
    `;
    renderRolesList();
    newRole();
  } else if (key === 'invites') {
    const opts = roles.map(r => `<option value="${r.id}">${escHtml(r.name)}</option>`).join('');
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Generate Invite Link</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Email (Optional restrict)</label><input class="form-input" id="iEmail"/></div>
            <div class="form-group"><label class="form-label">Role</label><select class="form-select" id="iRole">${opts}</select></div>
            <div class="form-group"><label class="form-label">Expires (Days)</label><input class="form-input" type="number" id="iDays" value="7"/></div>
          </div>
          <div id="iOut" class="form-hint" style="word-break:break-all;font-size:14px;color:var(--primary);font-weight:600"></div>
        </div>
        <div class="card-footer"><button class="btn btn-primary" onclick="addInvite()">Generate Link</button></div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">Active Invites</div></div><div class="card-body p-0" id="iListWrap">${skeletonTable}</div></div>
    `;
    renderInvites();
  } else if (key === 'activity') {
    c.innerHTML = `<div class="card"><div class="card-header"><div class="card-title">System Audit Log</div></div><div class="card-body p-0" id="aListWrap">${skeletonTable}</div></div>`;
    loadActivity();
  } else if (key === 'mcpConfig' || key === 'player') {
    // MediaCP and Player (simplified fallback structure)
    const isPlayer = key === 'player';
    c.innerHTML = `
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-meta"><h3>${isPlayer?'Player Configuration':'MediaCP Integration'}</h3><p>Configure streaming servers and metadata timings.</p></div>
          <div class="settings-content card"><div class="card-body">
            ${isPlayer ? `
            <div class="form-row">
              <div class="form-group"><label class="form-label">Metadata Refresh (ms)</label><input class="form-input" type="number" id="metadataRefreshMs"/></div>
              <div class="form-group"><label class="form-label">Reconnect Max Delay (ms)</label><input class="form-input" type="number" id="reconnectMaxDelayMs"/></div>
              <div class="form-group"><label class="form-label">Reconnect Backoff</label><input class="form-input" type="number" step="0.1" id="reconnectBackoff"/></div>
            </div>
            ` : `
            <div class="form-group"><label class="form-label">RPC URL</label><input class="form-input" id="mcpRpcUrl"/></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">API Key</label><input class="form-input" type="password" id="mcpApiKey"/></div>
              <div class="form-group"><label class="form-label">Radio Server ID</label><input class="form-input" type="number" id="mcpServerId"/></div>
              <div class="form-group"><label class="form-label">TV Server ID</label><input class="form-input" type="number" id="mcpTvServerId"/></div>
            </div>
            `}
          </div></div>
        </div>
        ${isPlayer ? '' : `
        <div class="settings-row" id="smtpCard">
          <div class="settings-meta"><h3>SMTP Configuration</h3><p>Global email sending service credentials.</p></div>
          <div class="settings-content card"><div class="card-body">
            <div class="form-row">
              <div class="form-group"><label class="form-label">SMTP Host</label><input class="form-input" id="smtpHost" placeholder="smtp.example.com"/></div>
              <div class="form-group"><label class="form-label">SMTP Port</label><input class="form-input" type="number" id="smtpPort" placeholder="587"/></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">SMTP User</label><input class="form-input" id="smtpUser"/></div>
              <div class="form-group"><label class="form-label">SMTP Password</label><input class="form-input" type="password" id="smtpPassword"/></div>
            </div>
            <div class="form-group"><label class="form-label">From Address</label><input class="form-input" id="smtpFrom" placeholder="noreply@radiostation.app"/></div>
          </div></div>
        </div>`}
        <div class="settings-row">
          <div class="settings-meta"></div>
          <div class="settings-content"><button class="btn btn-primary" onclick="saveGlobalConfig()">Save Configuration</button></div>
        </div>
      </div>
    `;
    fillForm(cfg);
    setTimeout(() => { if($('smtpCard') && !me.isSuperAdmin) hide($('smtpCard')); }, 0);
  }
}

/* ── Data Loaders & Renderers ── */
async function loadDashboardData() {
  try {
    const [np, ps, msgs, act] = await Promise.allSettled([api('/api/stream/now-playing' + (me && me.tenantId ? '?tenantId=' + me.tenantId : '?tenantId=global')), api('/api/push/stats'), api('/api/contact'), api('/api/activity?limit=5')]);
    if (np.status === 'fulfilled' && np.value.ok) {
      const d = np.value.data || {};
      const npT = $('npTitle'); if (npT) npT.textContent = (d.trackhistory && d.trackhistory[0]) || d.servername || 'Live Stream';
      const stL = $('stListeners'); if (stL) stL.textContent = d.connections ?? '—';
      const stS = $('stStatus'); if (stS) { stS.textContent = d.servername ? 'Online' : 'Offline'; stS.parentElement.classList.toggle('online', !!d.servername); }
    }
    if (ps.status === 'fulfilled') { const d = $('stDevices'); if (d) d.textContent = ps.value.deviceCount ?? '—'; }
    if (msgs.status === 'fulfilled') { const u = (msgs.value.messages || []).filter(m => !m.isRead).length; const el = $('stMessages'); if (el) el.textContent = u; }
    if (act.status === 'fulfilled') {
      const trs = (act.value.entries || []).map(e => `<tr><td><strong>${escHtml(e.action)}</strong></td><td>${escHtml(e.email || '—')}</td><td style="text-align:right" class="td-meta">${fmtDate(e.timestamp)}</td></tr>`).join('');
      const el = $('dashAct'); if (el) el.innerHTML = trs || '<tr><td colspan="3"><div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div><div class="empty-title">No recent activity</div><div class="empty-desc">Your platform activity will appear here.</div></div></td></tr>';
    }
  } catch {}
}

async function loadSchedule() {
  try {
    const r = await api('/api/schedule/all'); const ls = r.data || [];
    const html = ls.map(s => `<tr><td><strong>${escHtml(s.title)}</strong><span class="td-meta">${escHtml(s.description || '')}</span></td><td>${typeof s.dayOfWeek === 'number' ? DAYS[s.dayOfWeek] : (s.dayOfWeek || '')} ${escHtml(s.startTime)}-${escHtml(s.endTime)}</td><td>${escHtml(s.host)}</td><td><button class="btn btn-sm btn-danger-outline" onclick="delShow('${s.id}')">Delete</button></td></tr>`).join('');
    const el = $('sListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Show</th><th>Schedule</th><th>Host</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="empty-title">No shows scheduled</div><div class="empty-desc">Create your first radio show above.</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function loadPodcasts() {
  try {
    const r = await api('/api/podcasts/all'); const ls = r.data || [];
    const html = ls.map(p => `<tr><td><strong>${escHtml(p.title)}</strong></td><td>${escHtml(p.host)}<span class="td-meta">${escHtml(p.category)}</span></td><td><span class="badge ${p.isPublished ? 'badge-success' : 'badge-warning'}">${p.isPublished ? 'Published' : 'Draft'}</span></td><td><button class="btn btn-sm btn-danger-outline" onclick="delPod('${p.id}')">Delete</button></td></tr>`).join('');
    const el = $('pListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Episode</th><th>Host / Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div><div class="empty-title">No podcasts found</div><div class="empty-desc">Upload your first podcast episode above.</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function loadMessages() {
  try {
    const r = await api('/api/contact'); const ls = r.messages || [];
    const html = ls.map(m => `<tr><td><strong>${escHtml(m.name)}</strong><span class="td-meta">${escHtml(m.email)}</span></td><td style="max-width:400px;white-space:normal">${escHtml(m.message)}</td><td>${fmtDate(m.createdAt)}</td><td><div class="btn-group">${m.isRead ? '' : `<button class="btn btn-sm" onclick="readMsg('${m.id}')">Mark Read</button>`}<button class="btn btn-sm btn-danger-outline" onclick="delMsg('${m.id}')">Delete</button></div></td></tr>`).join('');
    const el = $('mListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Sender</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div class="empty-title">Inbox is empty</div><div class="empty-desc">You have no messages right now.</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function loadActivity() {
  try {
    const r = await api('/api/activity?limit=50'); const ls = r.entries || [];
    const html = ls.map(e => `<tr><td><strong>${escHtml(e.action)}</strong></td><td>${escHtml(e.email || '—')}</td><td>${escHtml(e.details || '—')}</td><td class="td-meta">${fmtDate(e.timestamp)}</td></tr>`).join('');
    const el = $('aListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Action</th><th>User</th><th>Details</th><th>Time</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="empty-title">No activity yet</div><div class="empty-desc">System logs will appear here.</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

function renderUsers() {
  const html = users.map(u => {
    const n = (u.firstName || u.lastName) ? `${u.firstName} ${u.lastName}`.trim() : '—';
    const a = u.avatarUrl ? `<img src="${escHtml(u.avatarUrl)}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px"/>` : `<span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--bg);color:var(--text);text-align:center;line-height:24px;margin-right:8px;font-size:11px;font-weight:700">${u.email[0].toUpperCase()}</span>`;
    return `<tr><td><div style="display:flex;align-items:center">${a}<div><strong>${escHtml(u.email)}</strong><span class="td-meta">${escHtml(n)} ${u.company?`• ${escHtml(u.company)}`:''}</span></div></div></td><td><span class="badge badge-neutral">${escHtml(u.roleName)}</span></td><td><span class="badge ${u.disabled ? 'badge-danger' : 'badge-success'}"><span class="dot ${u.disabled?'dot-red':'dot-green'}"></span>${u.disabled ? 'Disabled' : 'Active'}</span></td><td><button class="btn btn-sm btn-danger-outline" onclick="delUser('${u.id}')">Delete</button></td></tr>`;
  }).join('');
  const el = $('uListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div><div class="empty-title">No users</div><div class="empty-desc">Invite a user to get started.</div></div>';
}

function renderInvites() {
  const ls = invites.filter(i => !i.usedAt && !i.revokedAt && (!i.expiresAt || Date.now() < i.expiresAt));
  const html = ls.map(i => `<tr><td>${escHtml(i.email || 'Any')}</td><td><span class="badge badge-neutral">${escHtml(i.roleName)}</span></td><td>${fmtDate(i.expiresAt)}</td><td><button class="btn btn-sm btn-danger-outline" onclick="revInvite('${i.id}')">Revoke</button></td></tr>`).join('');
  const el = $('iListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Target Email</th><th>Role</th><th>Expires</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div class="empty-title">No active invites</div><div class="empty-desc">Generate an invite link above.</div></div>';
}

window.renderRolesList = function() {
  const html = roles.map(r => `<tr>
    <td><strong>${escHtml(r.name)}</strong></td>
    <td><span class="badge badge-neutral">${r.permissions.length} perms</span></td>
    <td style="text-align:right">
      <button class="btn btn-sm btn-primary-outline" onclick="editRole('${r.id}')">Edit</button>
      <button class="btn btn-sm btn-danger-outline" style="margin-left:8px" onclick="delRole('${r.id}')">Delete</button>
    </td>
  </tr>`).join('');
  const el = $('rListWrap');
  if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Role Name</th><th>Permissions</th><th style="text-align:right">Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state">No roles found</div>';
};

window.editRole = function(id) {
  roleEditId = id || '';
  const r = roles.find(x => x.id === id);
  if ($('rEditTitle')) $('rEditTitle').textContent = r ? 'Edit Role' : 'Create New Role';
  if ($('rName')) $('rName').value = r ? r.name : '';
  const sel = new Set(r ? r.permissions : []);
  
  if ($('pGrid')) {
    // Group permissions professionally
    const groups = {
      'System & Config': ['config:read', 'config:write'],
      'Users & Roles': ['users:read', 'users:write', 'roles:read', 'roles:write', 'invites:read', 'invites:write'],
      'Billing': ['billing:read', 'billing:write', 'plans:read', 'plans:write'],
      'MediaCP': ['mediacp:read', 'mediacp:write'],
      'Content (Schedule/Podcasts)': ['schedule:read', 'schedule:write', 'podcasts:read', 'podcasts:write'],
      'Mobile App': ['push:read', 'push:write', 'contact:read', 'contact:write', 'activity:read']
    };
    
    let html = '';
    const uncategorized = new Set(perms);
    
    for (const [groupName, groupPerms] of Object.entries(groups)) {
      const validGroupPerms = groupPerms.filter(p => perms.includes(p));
      if (validGroupPerms.length === 0) continue;
      validGroupPerms.forEach(p => uncategorized.delete(p));
      
      html += `<div style="grid-column: 1 / -1; font-weight: 600; margin-top: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">${groupName}</div>`;
      html += validGroupPerms.map(p => `<label class="perm-item" style="display:flex;align-items:center;gap:8px;padding:4px 0;"><input type="checkbox" id="p_${p}" ${sel.has(p) ? 'checked' : ''}/><span class="perm-name" style="font-size:13px">${p}</span></label>`).join('');
    }
    
    if (uncategorized.size > 0) {
      html += `<div style="grid-column: 1 / -1; font-weight: 600; margin-top: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 4px;">Other</div>`;
      html += Array.from(uncategorized).map(p => `<label class="perm-item" style="display:flex;align-items:center;gap:8px;padding:4px 0;"><input type="checkbox" id="p_${p}" ${sel.has(p) ? 'checked' : ''}/><span class="perm-name" style="font-size:13px">${p}</span></label>`).join('');
    }
    
    $('pGrid').innerHTML = html;
  }
};
window.newRole = function() { editRole(''); };

/* ── Actions ── */
window.mcpAction = async (act, serviceType = 'radio') => { 
  try { 
    const r = await api('/api/mediacp/' + act + (serviceType === 'tv' ? '?serviceType=tv' : ''), { method: 'POST', body: '{}' }); 
    if ($('mcpRes')) { show($('mcpRes')); $('mcpRes').textContent = JSON.stringify(r, null, 2); } 
    toast('Action queued successfully. Refreshing state...', 'success'); 
    
    // Automatically trigger an overview refresh after 2 seconds to fetch the updated state
    setTimeout(() => {
      if (typeof loadMediaCpOverview === 'function') loadMediaCpOverview(true);
    }, 2500);
  } catch (e) { 
    toast(e.message, 'error'); 
  } 
};
window.mcpUpdateTitle = async () => { const t = $('mcpTitle')?.value; if (!t) return; try { await api('/api/mediacp/update-title', { method: 'POST', body: JSON.stringify({ title: t }) }); if ($('mcpTitle')) $('mcpTitle').value = ''; toast('Title updated'); } catch (e) { toast(e.message, 'error'); } };
window.addShow = async () => { try { const d = $('sDay').value; await api('/api/schedule', { method: 'POST', body: JSON.stringify({ title: $('sTitle').value, host: $('sHost').value, dayOfWeek: d === 'daily' ? 'daily' : Number(d), startTime: $('sStart').value, endTime: $('sEnd').value, description: $('sDesc').value }) }); $('sTitle').value = ''; $('sHost').value = ''; $('sDesc').value = ''; toast('Show added'); loadSchedule(); } catch (e) { toast(e.message, 'error'); } };
window.delShow = async (id) => { try { await api('/api/schedule/' + id, { method: 'DELETE' }); toast('Deleted'); loadSchedule(); } catch (e) { toast(e.message, 'error'); } };
window.addPodcast = async () => { try { await api('/api/podcasts', { method: 'POST', body: JSON.stringify({ title: $('pTitle').value, host: $('pHost').value, category: $('pCat').value, audioUrl: $('pAudio').value, artwork: $('pArt').value, description: $('pDesc').value }) }); ['pTitle', 'pHost', 'pCat', 'pAudio', 'pArt', 'pDesc'].forEach(id => $(id).value = ''); toast('Podcast added'); loadPodcasts(); } catch (e) { toast(e.message, 'error'); } };
window.delPod = async (id) => { try { await api('/api/podcasts/' + id, { method: 'DELETE' }); toast('Deleted'); loadPodcasts(); } catch (e) { toast(e.message, 'error'); } };
window.sendPush = async () => { try { await api('/api/push/send', { method: 'POST', body: JSON.stringify({ title: $('nTitle').value, body: $('nBody').value }) }); $('nTitle').value = ''; $('nBody').value = ''; toast('Broadcast sent'); } catch (e) { toast(e.message, 'error'); } };
window.readMsg = async (id) => { try { await api('/api/contact/' + id + '/read', { method: 'PUT', body: '{}' }); loadMessages(); } catch (e) { toast(e.message, 'error'); } };
window.delMsg = async (id) => { try { await api('/api/contact/' + id, { method: 'DELETE' }); toast('Deleted'); loadMessages(); } catch (e) { toast(e.message, 'error'); } };
window.addUser = async () => { try { await api('/api/users', { method: 'POST', body: JSON.stringify({ email: $('uEmail').value, password: $('uPass').value, roleId: $('uRole').value }) }); $('uEmail').value = ''; $('uPass').value = ''; await loadUsers(); renderUsers(); toast('User created'); } catch (e) { toast(e.message, 'error'); } };
window.delUser = async (id) => { try { await api('/api/users/' + id, { method: 'DELETE' }); await loadUsers(); renderUsers(); toast('User deleted'); } catch (e) { toast(e.message, 'error'); } };
window.saveRole = async () => { try { const name = $('rName').value, ps = perms.filter(p => { const e = $('p_' + p); return e && e.checked; }); if (roleEditId) await api('/api/roles/' + roleEditId, { method: 'PUT', body: JSON.stringify({ name, permissions: ps }) }); else await api('/api/roles', { method: 'POST', body: JSON.stringify({ name, permissions: ps }) }); await loadRoles(); switchTab('roles'); toast('Role saved'); } catch (e) { toast(e.message, 'error'); } };
window.delRole = async (id) => { if (!id) return; try { await api('/api/roles/' + id, { method: 'DELETE' }); await loadRoles(); switchTab('roles'); toast('Role deleted'); } catch (e) { toast(e.message, 'error'); } };
window.addInvite = async () => { try { const r = await api('/api/invites', { method: 'POST', body: JSON.stringify({ email: $('iEmail').value, roleId: $('iRole').value, expiresInDays: Number($('iDays').value) || 7 }) }); $('iEmail').value = ''; $('iOut').innerHTML = `<a href="${r.inviteUrl}" target="_blank">${r.inviteUrl}</a>`; await loadInvites(); renderInvites(); toast('Invite created'); } catch (e) { toast(e.message, 'error'); } };
window.revInvite = async (id) => { try { await api('/api/invites/' + id + '/revoke', { method: 'POST', body: '{}' }); await loadInvites(); renderInvites(); toast('Revoked'); } catch (e) { toast(e.message, 'error'); } };

window.uploadTvMedia = async () => {
  const f = $('tvUpload')?.files[0]; if (!f) return toast('Please select a file', 'error');
  try {
    const fd = new FormData(); fd.append('file', f);
    await fetch('/api/mediacp/upload?serviceType=tv', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    toast('Media uploaded to TV Station');
    $('tvUpload').value = '';
  } catch (e) { toast(e.message, 'error'); }
};

window.loadAdminPlans = async () => {
  try {
    const r = await api('/api/plans/all');
    const html = (r.data || []).map(p => `<tr><td><strong>${escHtml(p.name)}</strong></td><td>${escHtml(p.type)}</td><td>NGN ${p.price}</td><td><span class="badge ${p.isActive ? 'badge-success' : 'badge-neutral'}">${p.isActive ? 'Active' : 'Inactive'}</span></td></tr>`).join('');
    const el = $('aPlansList'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Plan</th><th>Type</th><th>Price</th><th>Status</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div><div class="empty-title">No plans</div><div class="empty-desc">Create your first SaaS plan.</div></div>';
  } catch(e) {}
};

window.createPlan = async () => {
  try {
    await api('/api/plans', { method: 'POST', body: JSON.stringify({ name: $('planName').value, type: $('planType').value, price: $('planPrice').value }) });
    toast('Plan created successfully');
    $('planName').value = ''; $('planPrice').value = '5000';
    loadAdminPlans();
  } catch(e) { toast(e.message, 'error'); }
};

window.loadBilling = async () => {
  try {
    const pr = await api('/api/plans');
    const html1 = (pr.data || []).map(p => `<div style="padding:16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;"><div><strong>${escHtml(p.name)}</strong><br/><small>${escHtml(p.type)} - NGN ${p.price}/mo</small></div><div><button class="btn btn-primary btn-sm" onclick="checkout('${p.id}', 'PAYSTACK')">Pay via Paystack</button> <button class="btn btn-primary btn-sm" onclick="checkout('${p.id}', 'FLUTTERWAVE')">Pay via Flutterwave</button></div></div>`).join('');
    const el1 = $('bPlansList'); if (el1) el1.innerHTML = html1 || '<div class="empty-state"><div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div><div class="empty-title">No active plans</div><div class="empty-desc">No plans available at the moment.</div></div>';

    const sr = await api('/api/billing/subscriptions');
    const html2 = (sr.data || []).map(s => `<tr><td><strong>${escHtml(s.plan?.name || 'Unknown')}</strong></td><td><span class="badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}">${s.status}</span></td><td>${fmtDate(s.nextBillingDate)}</td></tr>`).join('');
    const el2 = $('bSubsList'); if (el2) el2.innerHTML = html2 ? `<div class="table-wrap"><table><thead><tr><th>Plan</th><th>Status</th><th>Next Billing</th></tr></thead><tbody>${html2}</tbody></table></div>` : '<div class="empty-state">No subscriptions yet</div>';
  } catch(e) {}
};

window.loadFeatureTenants = async () => {
  try {
    const r = await api('/api/admin/tenants');
    const opts = (r.data || []).map(t => `<option value="${t.id}">${escHtml(t.name)}</option>`).join('');
    if ($('tfTenantSel')) $('tfTenantSel').innerHTML = `<option value="">-- Select Tenant --</option>${opts}`;
  } catch(e) {}
};

window.loadTenantFeatures = async () => {
  const tId = $('tfTenantSel').value;
  if (!tId) { hide($('tfWrap')); return; }
  try {
    const r = await api('/api/admin/tenants/' + tId + '/features');
    if (r.data) {
      if ($('tfPodcasts')) $('tfPodcasts').checked = !!r.data.enablePodcasts;
      if ($('tfSchedule')) $('tfSchedule').checked = r.data.enableSchedule !== false;
      if ($('tfNotifications')) $('tfNotifications').checked = r.data.enableNotifications !== false;
    }
    show($('tfWrap'));
  } catch(e) { toast(e.message, 'error'); }
};

window.saveTenantFeatures = async () => {
  const tId = $('tfTenantSel').value;
  if (!tId) return;
  try {
    const feats = {
      enablePodcasts: $('tfPodcasts').checked,
      enableSchedule: $('tfSchedule').checked,
      enableNotifications: $('tfNotifications').checked
    };
    await api('/api/admin/tenants/' + tId + '/features', { method: 'PUT', body: JSON.stringify(feats) });
    toast('Features updated successfully');
  } catch(e) { toast(e.message, 'error'); }
};

window.loadSystemSetup = async () => {
  try {
    const r = await api('/api/admin/setup');
    if (r.data) {
      if ($('env_paystack_pub')) $('env_paystack_pub').value = r.data.PAYSTACK_PUBLIC_KEY || '';
      if ($('env_paystack_sec')) $('env_paystack_sec').placeholder = r.data.PAYSTACK_SECRET_KEY || 'Leave blank to keep existing';
      if ($('env_flw_pub')) $('env_flw_pub').value = r.data.FLUTTERWAVE_PUBLIC_KEY || '';
      if ($('env_flw_sec')) $('env_flw_sec').placeholder = r.data.FLUTTERWAVE_SECRET_KEY || 'Leave blank to keep existing';
      if ($('env_mcp_url')) $('env_mcp_url').value = r.data.MEDIACP_API_URL || '';
      if ($('env_mcp_key')) $('env_mcp_key').placeholder = r.data.MEDIACP_API_KEY || 'Leave blank to keep existing';
    }
  } catch(e) { toast(e.message, 'error'); }
};

window.saveSystemSetup = async () => {
  try {
    const payload = {};
    if ($('env_paystack_pub')) payload.PAYSTACK_PUBLIC_KEY = $('env_paystack_pub').value;
    if ($('env_paystack_sec') && $('env_paystack_sec').value) payload.PAYSTACK_SECRET_KEY = $('env_paystack_sec').value;
    if ($('env_flw_pub')) payload.FLUTTERWAVE_PUBLIC_KEY = $('env_flw_pub').value;
    if ($('env_flw_sec') && $('env_flw_sec').value) payload.FLUTTERWAVE_SECRET_KEY = $('env_flw_sec').value;
    if ($('env_mcp_url')) payload.MEDIACP_API_URL = $('env_mcp_url').value;
    if ($('env_mcp_key') && $('env_mcp_key').value) payload.MEDIACP_API_KEY = $('env_mcp_key').value;

    await api('/api/admin/setup', { method: 'PUT', body: JSON.stringify(payload) });
    toast('System configuration updated and applied globally.', 'success');
    if ($('env_paystack_sec')) $('env_paystack_sec').value = '';
    if ($('env_flw_sec')) $('env_flw_sec').value = '';
    if ($('env_mcp_key')) $('env_mcp_key').value = '';
    loadSystemSetup();
  } catch(e) { toast(e.message, 'error'); }
};

window.loadSuperAdminBilling = async () => {
  try {
    const sr = await api('/api/billing/all-subscriptions');
    let totalRevenue = 0;
    let activeSubs = 0;
    const html2 = (sr.data || []).map(s => {
      if (s.status === 'ACTIVE') {
        activeSubs++;
        totalRevenue += (s.plan?.price || 0);
      }
      return `<tr><td><strong>${escHtml(s.tenant?.name || 'Unknown Tenant')}</strong></td><td>${escHtml(s.plan?.name || 'Unknown Plan')}</td><td><span class="badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}">${s.status}</span></td><td>${fmtDate(s.nextBillingDate)}</td></tr>`;
    }).join('');
    
    if ($('bTotRev')) $('bTotRev').textContent = 'NGN ' + totalRevenue.toLocaleString();
    if ($('bActSubs')) $('bActSubs').textContent = activeSubs;
    
    const el2 = $('bAllSubsList'); if (el2) el2.innerHTML = html2 ? `<div class="table-wrap"><table><thead><tr><th>Tenant</th><th>Plan</th><th>Status</th><th>Next Billing</th></tr></thead><tbody>${html2}</tbody></table></div>` : '<div class="empty-state">No subscriptions found</div>';
  } catch(e) {}
};

window.checkout = async (planId, provider) => {
  try {
    toast('Initializing checkout...');
    const r = await api('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ planId, provider }) });
    if (r.paymentUrl) window.open(r.paymentUrl, '_blank');
  } catch(e) { toast(e.message, 'error'); }
};

/* ── Auth & Global ── */
if($('loginBtn')) $('loginBtn').addEventListener('click', async () => {
  hide($('loginMsg'));
  try {
    const r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('email').value, password: $('password').value }) });
    me = r.user; hide($('loginPage')); hide($('invitePage')); show($('app'));
    if(typeof updateProfileUI === 'function') updateProfileUI();
    await loadAll(); switchTab('dashboard');
  } catch (e) { const m = $('loginMsg'); m.textContent = e.message; show(m); }
});

if($('showRegisterBtn')) $('showRegisterBtn').addEventListener('click', (e) => {
  e.preventDefault();
  hide($('loginPage'));
  show($('registerPage'));
});

if($('showLoginBtn')) $('showLoginBtn').addEventListener('click', (e) => {
  e.preventDefault();
  hide($('registerPage'));
  show($('loginPage'));
});

if($('registerBtn')) $('registerBtn').addEventListener('click', async () => {
  hide($('registerMsg'));
  try {
    const payload = {
      stationName: $('regStation').value,
      email: $('regEmail').value,
      password: $('regPassword').value
    };
    const r = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    me = r.user; hide($('registerPage')); hide($('loginPage')); hide($('invitePage')); show($('app'));
    if(typeof updateProfileUI === 'function') updateProfileUI();
    await loadAll(); switchTab('dashboard');
  } catch (e) { const m = $('registerMsg'); m.textContent = e.message; show(m); }
});

if($('acceptInviteBtn')) $('acceptInviteBtn').addEventListener('click', async () => {
  hide($('inviteMsg'));
  try {
    const r = await api('/api/auth/accept-invite', { method: 'POST', body: JSON.stringify({ token: inviteToken, email: $('inviteEmail').value, password: $('invitePassword').value }) });
    me = r.user; hide($('invitePage')); show($('app'));
    if(typeof updateProfileUI === 'function') updateProfileUI();
    await loadAll(); switchTab('dashboard');
  } catch (e) { const m = $('inviteMsg'); m.textContent = e.message; show(m); }
});

if($('logoutBtn')) $('logoutBtn').addEventListener('click', async () => { await api('/api/auth/logout', { method: 'POST', body: '{}' }).catch(() => {}); location.reload(); });

async function saveGlobalConfig() {
  try { 
    setStatus('Saving...'); 
    await api('/api/config', { method: 'PUT', body: JSON.stringify(readForm()) }); 
    toast('Configuration saved!'); 
    setStatus('Saved'); 
    applyAdminBranding(); 
  }
  catch (e) { 
    toast(e.message, 'error'); 
    setStatus('Error'); 
  }
}

/* ── Provisioning Logic ── */
async function loadProvisioningJobs() {
  const w = $('provListWrap');
  if (!w) return;
  try {
    const { data } = await api('/api/admin/provisioning-jobs');
    if (!data || !data.length) {
      w.innerHTML = '<div class="empty-state" style="padding:24px;text-align:center;color:var(--text-tertiary)">No provisioning jobs found.</div>';
      return;
    }
    let html = '<table class="table"><thead><tr><th>ID</th><th>Tenant</th><th>Status</th><th>Attempts</th><th>Date</th><th>Action</th></tr></thead><tbody>';
    for (const j of data) {
      let badgeColor = 'var(--text-tertiary)';
      if(j.status === 'COMPLETED') badgeColor = 'var(--success)';
      else if(j.status === 'FAILED') badgeColor = 'var(--danger)';
      else if(j.status === 'PROCESSING') badgeColor = 'var(--primary)';
      
      html += `<tr>
        <td><div style="font-family:monospace;font-size:12px">${j.id.slice(0, 8)}</div></td>
        <td>${j.tenant ? j.tenant.name : '-'}</td>
        <td><span class="badge" style="color:${badgeColor}">${j.status}</span></td>
        <td>${j.attempts}</td>
        <td>${new Date(j.createdAt).toLocaleDateString()}</td>
        <td>
          ${j.status === 'FAILED' ? `<button class="btn btn-sm btn-ghost" onclick="retryProvisioningJob('${j.id}')">Retry</button>` : '-'}
        </td>
      </tr>`;
    }
    html += '</tbody></table>';
    w.innerHTML = html;
  } catch (e) {
    w.innerHTML = `<div class="empty-state" style="padding:24px;text-align:center;color:var(--danger)">Error: ${e.message}</div>`;
  }
}

async function retryProvisioningJob(id) {
  try {
    await api(`/api/admin/provisioning-jobs/${id}/retry`, { method: 'POST', body: '{}' });
    toast('Job queued for retry');
    loadProvisioningJobs();
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function saveAppConfig() {
  setStatus('Saving...');
  try {
    const profile = { name: $('appName').value, description: $('appDescription').value };
    const branding = { logoUrl: $('appLogoUrl').value, splashUrl: $('appSplashUrl').value, primaryColor: $('appPrimaryColor').value, accentColor: $('appAccentColor').value, theme: $('appTheme').value };
    const contact = { email: $('appContactEmail').value, whatsapp: $('appContactWhatsapp').value, website: $('appContactWebsite').value, supportUrl: $('appContactSupportUrl').value };
    const social = { facebook: $('appSocialFacebook').value, twitter: $('appSocialTwitter').value, instagram: $('appSocialInstagram').value, youtube: $('appSocialYoutube').value };
    const features = { enableChat: $('appFeatureChat').checked, enablePodcasts: $('appFeaturePodcasts').checked, enableSchedule: $('appFeatureSchedule').checked };

    await api('/api/appConfig/profile', { method: 'PUT', body: JSON.stringify(profile) });
    await api('/api/appConfig/branding', { method: 'PUT', body: JSON.stringify(branding) });
    await api('/api/appConfig/contact', { method: 'PUT', body: JSON.stringify(contact) });
    await api('/api/appConfig/social', { method: 'PUT', body: JSON.stringify(social) });
    
    toast('Mobile Config saved!');
    setStatus('Saved');
  } catch (e) {
    toast(e.message, 'error');
    setStatus('Error');
  }
}

/* ── Init ── */
(async () => {
  const params = new URLSearchParams(location.search || '');
  inviteToken = params.get('token') || '';
  if (inviteToken) { show($('invitePage')); return; }
  try {
    const r = await api('/api/me'); me = r.user;
    hide($('loginPage')); show($('app'));
    if(typeof updateProfileUI === 'function') updateProfileUI();
    
    if (!me.isSuperAdmin) {
      if ($('adminNav')) hide($('adminNav'));
    }

    const hideTab = (name) => {
      const el = document.querySelectorAll(`[data-tab="${name}"]`);
      el.forEach(e => hide(e));
    };

    if (!hasPerm('users:read')) hide($('usersNav'));
    if (!hasPerm('roles:read')) hide($('rolesNav'));
    if (!hasPerm('invites:read')) hide($('invitesNav'));
    if (!hasPerm('activity:read')) hide($('activityNav'));
    
    if (!hasPerm('config:read')) {
      hideTab('general');
      hideTab('urls');
      hideTab('branding');
      hideTab('seo');
      hideTab('mcpConfig');
    }
    
    if (!hasPerm('mediacp:read')) {
      hideTab('stream');
      hideTab('tv');
      hideTab('schedule');
    }
    
    if (!hasPerm('podcasts:read')) hideTab('podcasts');
    if (!hasPerm('push:read')) hideTab('push');
    if (!hasPerm('contact:read')) hideTab('messages');
    
    if (!hasPerm('billing:read')) {
      const tBill = document.querySelector('.nav-section:nth-child(2) [data-tab="billing"]');
      if (tBill) hide(tBill);
    }
    
    await loadAll(); switchTab('dashboard');
  } catch (e) { show($('loginPage')); }
})();

async function loadMediaCPCredentials() {
  const p = document.getElementById('mcpCredentialsPanel');
  if (!p) return;
  try {
    const r = await api('/api/mediacp/credentials');
    let html = '<div style="padding:16px;">';
    
    if (r.account) {
      html += '<h4 style="margin-bottom:8px;">Control Panel</h4>';
      html += '<p><strong>Login URL:</strong> <a href="' + r.account.loginUrl + '" target="_blank">' + r.account.loginUrl + '</a></p>';
      html += '<p><strong>Email:</strong> ' + r.account.email + '</p>';
      html += '<p><strong>Password:</strong> ' + r.account.password + '</p>';
      html += '<hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border);">';
    }

    if (r.services && r.services.length > 0) {
      html += '<h4 style="margin-bottom:8px;">Streaming Services</h4>';
      html += '<div class="table-wrap"><table><thead><tr><th>Domain</th><th>Type</th><th>Password</th><th>Status</th></tr></thead><tbody>';
      r.services.forEach(s => {
        html += '<tr>';
        html += '<td>' + (s.domain || 'N/A') + '</td>';
        html += '<td><span class="badge badge-info">' + s.type + '</span></td>';
        html += '<td>' + (s.streamPassword || 'N/A') + '</td>';
        html += '<td><span class="badge ' + (s.status==='active'?'badge-success':'') + '">' + s.status + '</span></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    } else {
      html += '<p style="color:var(--text-tertiary)">No services provisioned yet.</p>';
    }
    
    html += '</div>';
    p.innerHTML = html;
  } catch (e) {
    p.innerHTML = '<div style="padding:16px;color:var(--danger);text-align:center">' + e.message + '</div>';
  }
}

async function loadMediaCpOverview(silent = false) {
  try {
    const r = await api('/api/mediacp/overview');
    if (!r || r.error) return;
    
    // Setup Audio Player URL
    const audio = $('mcpAudioElement');
    if (audio) {
      let targetSrc = r.streamUrl || cfg?.streamUrl || `https://${r.domain}:${r.portbase}/stream`;
      // Ensure shoutcast returns an HTTP stream by appending ;/
      if (targetSrc && targetSrc.endsWith('/stream')) targetSrc += ';/';
      if (audio.src !== targetSrc) audio.src = targetSrc;
    }

    // Public Page Link
    if ($('mcpPublicPageBtn') && r.publicPageUrl) {
      $('mcpPublicPageBtn').style.display = 'flex';
      $('mcpPublicPageBtn').href = r.publicPageUrl;
    }

    // Now Playing / Source
    if ($('mcpSource')) $('mcpSource').textContent = (r.plugin || 'AUTODJ').toUpperCase();
    if ($('mcpNowPlaying') && r.stats?.nowplaying) $('mcpNowPlaying').textContent = r.stats.nowplaying;
    
    // Status indicator
    const liveInd = $('mcpLiveIndicator');
    if (liveInd) {
      const isOnline = r.status === 1 || r.state === 'active' || r.laststate === 'online' || r.stats?.status === 1;
      liveInd.style.background = isOnline ? 'var(--danger)' : 'var(--text-tertiary)';
      liveInd.style.boxShadow = isOnline ? '0 0 8px var(--danger)' : 'none';
      if (!isOnline && audio && !audio.paused) {
        // Automatically pause player if stream goes offline
        toggleMcpPlayer(true);
      }
    }

    // Listeners
    if ($('mcpListeners')) {
      $('mcpListeners').textContent = `${r.stats?.connections || 0} / ${r.maxuser || 0}`;
    }

    // Bandwidth (bytes to MB/GB)
    if ($('mcpBandwidth')) {
      const tx = r.stats?.transfer || 0;
      const txMb = (tx / (1024 * 1024)).toFixed(1);
      const quota = r.quota || 0;
      const quotaGb = (quota / 1024).toFixed(0);
      $('mcpBandwidth').textContent = `${txMb} MB / ${quotaGb} GB`;
    }

    // Storage (bytes to GB)
    if ($('mcpStorage')) {
      const storage = r.stats?.storage || 0;
      const storageGb = (storage / (1024 * 1024 * 1024)).toFixed(2);
      const storageLimitGb = ((r.storagelimit || 26000) / 1024).toFixed(0);
      $('mcpStorage').textContent = `${storageGb} GB / ${storageLimitGb} GB`;
    }

    // Track history
    const recentTracksEl = $('mcpRecentTracks');
    if (recentTracksEl) {
      if (r.trackHistory && r.trackHistory.length > 0) {
        recentTracksEl.innerHTML = '';
        r.trackHistory.forEach(track => {
          recentTracksEl.innerHTML += `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);">
              <img src="${track.cover || 'https://via.placeholder.com/48'}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;background:var(--surface-active);" onerror="this.src='https://via.placeholder.com/48'"/>
              <div style="display:flex;flex-direction:column;overflow:hidden;">
                <span style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${track.title || 'Unknown Title'}</span>
                <span style="font-size:12px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${track.artist || 'Unknown Artist'}</span>
              </div>
            </div>
          `;
        });
      } else {
        recentTracksEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-tertiary);">No recent tracks available.</div>';
      }
    }
  } catch (e) {
    if(!silent) console.error('MediaCP overview error:', e);
  }
}

window.toggleMcpPlayer = function(forceStop = false) {
  const audio = $('mcpAudioElement');
  const icon = $('mcpPlayIcon');
  if (!audio) return;
  
  if (audio.paused && !forceStop) {
    icon.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'; // Loading spinner imitation
    
    // Crucial for live streams: reload the source to clear stale browser buffer before playing
    audio.load();
    
    audio.play().then(() => {
      icon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    }).catch(e => {
      console.error(e);
      icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      toast('Could not play stream. It may be offline.', 'error');
    });
  } else {
    audio.pause();
    audio.currentTime = 0; // Reset
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  }
};

window.openWidgetSettings = async function() {
  $('widgetSettingsModal').classList.remove('hide');
  try {
    const res = await api('/api/mediacp/widgets');
    if (res && res.ok && res.data) {
      $('mapEmbedCodeInput').value = res.data.mapEmbedCode || '';
      $('chartEmbedCodeInput').value = res.data.chartEmbedCode || '';
    }
  } catch(e) {
    console.error(e);
  }
};

window.saveWidgetSettings = async function() {
  const mapCode = $('mapEmbedCodeInput').value.trim();
  const chartCode = $('chartEmbedCodeInput').value.trim();
  
  try {
    const res = await api('/api/mediacp/widgets', {
      method: 'POST',
      body: JSON.stringify({ mapEmbedCode: mapCode, chartEmbedCode: chartCode })
    });
    if (res && res.ok) {
      toast('Widget settings saved', 'success');
      $('widgetSettingsModal').classList.add('hide');
      renderDashboardWidgets(mapCode, chartCode);
    } else {
      toast('Failed to save settings', 'error');
    }
  } catch(e) {
    console.error(e);
    toast('Error saving settings', 'error');
  }
};

function renderDashboardWidgets(mapCode, chartCode) {
  // Map Container
  const mapContainer = document.querySelector('.mcp-widgets-grid .card:nth-child(2) .card-body');
  if (mapContainer) {
    if (mapCode) {
      mapContainer.innerHTML = mapCode;
      mapContainer.style.padding = '0';
      const iframe = mapContainer.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
      }
    } else {
      mapContainer.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.5;"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/></svg><p style="margin:0;font-size:14px;">Awaiting Map Widget Embed Code</p><small style="opacity:0.7;">Requires MediaCP Iframe</small></div>';
      mapContainer.style.padding = '';
    }
  }
  
  // Chart Container
  const chartContainer = document.querySelector('.mcp-widgets-grid .card:nth-child(3) .card-body');
  if (chartContainer) {
    if (chartCode) {
      chartContainer.innerHTML = chartCode;
      chartContainer.style.padding = '0';
      const iframe = chartContainer.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
      }
    } else {
      chartContainer.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.5;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><p style="margin:0;font-size:14px;">Awaiting Chart Embed Code</p></div>';
      chartContainer.style.padding = '';
    }
  }
}

// Initial fetch and render of widgets when the radio control tab loads
const originalRenderStreamTab = window.renderStreamTab || renderStreamTab;
window.renderStreamTab = function(c, key) {
  originalRenderStreamTab(c, key);
  if (key === 'radio') {
    // Load existing widgets automatically
    api('/api/mediacp/widgets').then(res => {
      if (res && res.ok && res.data) {
        renderDashboardWidgets(res.data.mapEmbedCode, res.data.chartEmbedCode);
      }
    }).catch(e => console.error(e));
  }
};
window.switchAutoDjTab = function(tab) {
  $('btnTabMedia').classList.remove('btn-primary');
  $('btnTabPlaylists').classList.remove('btn-primary');
  $('btnTabSchedule').classList.remove('btn-primary');
  
  $('autodjMediaView').classList.add('hide');
  $('autodjPlaylistsView').classList.add('hide');
  $('autodjScheduleView').classList.add('hide');
  
  if (tab === 'media') {
    $('btnTabMedia').classList.add('btn-primary');
    $('autodjMediaView').classList.remove('hide');
    loadMcpMedia();
  } else if (tab === 'playlists') {
    $('btnTabPlaylists').classList.add('btn-primary');
    $('autodjPlaylistsView').classList.remove('hide');
    loadMcpPlaylists();
  } else if (tab === 'schedule') {
    $('btnTabSchedule').classList.add('btn-primary');
    $('autodjScheduleView').classList.remove('hide');
    loadMcpEvents();
  }
};

window.mcpNavigateUp = function() {
  if (window.currentMcpPath === '/') return;
  const parts = window.currentMcpPath.split('/').filter(Boolean);
  parts.pop();
  window.currentMcpPath = '/' + parts.join('/');
  loadMcpMedia();
};

window.loadMcpMedia = async function() {
  const listWrap = $('mcpMediaList');
  if (!listWrap) return;
  listWrap.innerHTML = '<tr><td colspan="4"><div class="skeleton"></div></td></tr>';
  $('mcpCurrentPath').textContent = window.currentMcpPath;
  
  try {
    const res = await api('/api/mediacp/media?path=' + encodeURIComponent(window.currentMcpPath));
    if (res && !res.error) {
      const folders = res.folders || [];
      const tracks = (res.tracks && res.tracks.data) ? res.tracks.data : [];
      const media = [...folders.map(f => ({ type: 'directory', id: f.id, title: f.title, path: f.path })), ...tracks.map(t => ({ type: 'file', id: t.id, title: t.title, size: t.size || 0 }))];
      if (media.length === 0) {
        listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);">No files in this folder</td></tr>';
        return;
      }
      
      listWrap.innerHTML = media.map(m => {
        const isDir = m.type === 'directory';
        const icon = isDir ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
        
        const action = isDir ? 
          `<button class="btn btn-sm btn-primary-outline" onclick="window.currentMcpPath='${m.path}';loadMcpMedia()">Open</button>` :
          `<button class="btn btn-sm btn-danger-outline" onclick="deleteMcpMedia('${m.id}')">Delete</button>`;
          
        return `
          <tr>
            <td style="display:flex;align-items:center;gap:8px;">${icon} ${m.title || m.name}</td>
            <td>${m.type}</td>
            <td>${m.size ? (m.size / (1024*1024)).toFixed(2) + ' MB' : '-'}</td>
            <td>${action}</td>
          </tr>
        `;
      }).join('');
    } else {
      listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load media: ' + (res && res.message ? res.message : 'Unknown error') + '</td></tr>';
    }
  } catch(e) {
    listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Error loading media</td></tr>';
  }
};

window.mcpCreateFolderPrompt = async function() {
  const title = prompt("Enter folder name:");
  if (!title) return;
  try {
    const res = await api('/api/mediacp/media/folder', { method: 'POST', body: JSON.stringify({ path: window.currentMcpPath, title }) });
    if (res && res.error) {
      toast('Failed to create folder: ' + res.message, 'error');
    } else {
      toast('Folder created', 'success');
      loadMcpMedia();
    }
  } catch(e) {
    toast('Error creating folder', 'error');
  }
};

window.deleteMcpMedia = async function(trackId) {
  if (!confirm("Are you sure you want to delete this track?")) return;
  try {
    const res = await api('/api/mediacp/media/delete', { method: 'POST', body: JSON.stringify({ trackIds: [trackId] }) });
    if (res && !res.error) {
      toast('Media deleted', 'success');
      loadMcpMedia();
    } else {
      toast('Failed to delete media', 'error');
    }
  } catch(e) {
    toast('Error deleting media', 'error');
  }
};

window.handleMcpUpload = async function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  toast('Uploading media...', 'info');
  try {
    const res = await fetch('/api/mediacp/upload?serviceType=radio', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
      body: formData
    });
    const data = await res.json();
    if (data.ok || (data.result === 'success')) {
      toast('Upload complete', 'success');
      loadMcpMedia();
    } else {
      toast('Upload failed: ' + (data.error || data.message || 'Unknown error'), 'error');
    }
  } catch(err) {
    toast('Upload error', 'error');
  }
  e.target.value = '';
};

window.loadMcpPlaylists = async function() {
  const listWrap = $('mcpPlaylistList');
  if (!listWrap) return;
  listWrap.innerHTML = '<tr><td colspan="4"><div class="skeleton"></div></td></tr>';
  
  try {
    const res = await api('/api/mediacp/playlists');
    if (res && !res.error) {
      const arr = res.playlists ? (res.playlists.data || res.playlists) : (Array.isArray(res) ? res : (res.data || []));
      if (!arr || arr.length === 0) {
        listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);">No playlists found</td></tr>';
        return;
      }
      
      listWrap.innerHTML = arr.map(p => {
        return `
          <tr>
            <td style="font-weight:500;">${p.title}</td>
            <td><span class="badge badge-info">${p.type}</span></td>
            <td>${p.status === 1 ? '<span class="badge badge-success">Enabled</span>' : '<span class="badge">Disabled</span>'}</td>
            <td>
              <button class="btn btn-sm btn-danger-outline" onclick="deleteMcpPlaylist('${p.id}')">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load playlists: ' + (res && res.message ? res.message : 'Unknown error') + '</td></tr>';
    }
  } catch(e) {
    listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Error loading playlists</td></tr>';
  }
};

window.mcpCreatePlaylistPrompt = async function() {
  const title = prompt("Enter playlist name:");
  if (!title) return;
  
  try {
    const res = await api('/api/mediacp/playlists', {
      method: 'POST',
      body: JSON.stringify({
        title,
        type: 'general',
        status: 1
      })
    });
    if (res && res.error) {
      toast('Failed to create playlist', 'error');
    } else {
      toast('Playlist created', 'success');
      loadMcpPlaylists();
    }
  } catch(e) {
    toast('Error creating playlist', 'error');
  }
};

window.deleteMcpPlaylist = async function(id) {
  if (!confirm("Are you sure you want to delete this playlist?")) return;
  try {
    const res = await api('/api/mediacp/playlists/' + id, { method: 'DELETE' });
    if (res && !res.error) {
      toast('Playlist deleted', 'success');
      loadMcpPlaylists();
    } else {
      toast('Failed to delete playlist', 'error');
    }
  } catch(e) {
    toast('Error deleting playlist', 'error');
  }
};

window.loadMcpEvents = async function() {
  const listWrap = $('mcpScheduleList');
  if (!listWrap) return;
  listWrap.innerHTML = '<tr><td colspan="4"><div class="skeleton"></div></td></tr>';
  
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const startStr = today.toISOString().split('T')[0];
    const endStr = nextWeek.toISOString().split('T')[0];
    
    const res = await api('/api/mediacp/events?start=' + startStr + '&end=' + endStr);
    
    if (res && !res.error) {
      const arr = Array.isArray(res) ? res : (res.data || []);
      if (!arr || arr.length === 0) {
        listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);">No scheduled events found</td></tr>';
        return;
      }
      
      listWrap.innerHTML = arr.map(ev => {
        return `
          <tr>
            <td style="font-weight:500;">${ev.title}</td>
            <td>${new Date(ev.start).toLocaleString()}</td>
            <td>${new Date(ev.end).toLocaleString()}</td>
            <td>
              <button class="btn btn-sm btn-danger-outline" onclick="deleteMcpEvent('${ev.id}')">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load events: ' + (res && res.message ? res.message : 'Unknown error') + '</td></tr>';
    }
  } catch(e) {
    listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Error loading events</td></tr>';
  }
};

window.mcpCreateEventPrompt = async function() {
  const title = prompt("Enter event name (e.g., Morning Show):");
  if (!title) return;
  
  const startTime = prompt("Enter start time (YYYY-MM-DD HH:MM):", new Date().toISOString().slice(0, 16).replace('T', ' '));
  if (!startTime) return;
  
  const endTime = prompt("Enter end time (YYYY-MM-DD HH:MM):");
  if (!endTime) return;
  
  try {
    const res = await api('/api/mediacp/events', {
      method: 'POST',
      body: JSON.stringify({
        title,
        type: 'playlist',
        start: startTime,
        end: endTime,
        playlist_id: 1 
      })
    });
    
    if (res && res.error) {
      toast('Failed to schedule event: ' + res.message, 'error');
    } else {
      toast('Event scheduled', 'success');
      loadMcpEvents();
    }
  } catch(e) {
    toast('Error scheduling event', 'error');
  }
};

window.deleteMcpEvent = async function(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  try {
    const res = await api('/api/mediacp/events/' + id, { method: 'DELETE' });
    if (res && !res.error) {
      toast('Event deleted', 'success');
      loadMcpEvents();
    } else {
      toast('Failed to delete event', 'error');
    }
  } catch(e) {
    toast('Error deleting event', 'error');
  }
};
