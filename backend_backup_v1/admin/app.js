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
      <div class="card">
        <div class="card-header"><div class="card-header-content"><div class="card-title">Service Control</div><div class="card-subtitle">Manage streaming service state</div></div></div>
        <div class="card-body">
          <div class="btn-group">
            <button class="btn btn-success" onclick="mcpAction('start')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Start Service</button>
            <button class="btn btn-danger" onclick="mcpAction('stop')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>Stop Service</button>
            <button class="btn btn-warning" onclick="mcpAction('restart')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>Restart</button>
            <button class="btn" onclick="mcpAction('kick-source')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>Kick Source</button>
          </div>
          <pre id="mcpRes" class="hide" style="margin-top:16px;background:var(--surface-active);padding:12px;border-radius:var(--radius);font-size:12px;overflow:auto;border:1px solid var(--border)"></pre>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Update Metadata</div></div>
        <div class="card-body"><div class="form-row"><div class="form-group"><input class="form-input" id="mcpTitle" placeholder="Now playing title..."/></div><button class="btn btn-primary" onclick="mcpUpdateTitle()">Update</button></div></div>
      </div>
    `;
  } else if (key === 'schedule') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Add Show</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="sTitle"/></div>
            <div class="form-group"><label class="form-label">Host</label><input class="form-input" id="sHost"/></div>
            <div class="form-group"><label class="form-label">Day</label><select class="form-select" id="sDay">${DAYS.map((d,i)=>`<option value="${i<7?i:'daily'}">${d}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Start</label><input class="form-input" type="time" id="sStart" value="09:00"/></div>
            <div class="form-group"><label class="form-label">End</label><input class="form-input" type="time" id="sEnd" value="12:00"/></div>
          </div>
          <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="sDesc"/></div>
        </div>
        <div class="card-footer"><button class="btn btn-primary" onclick="addShow()">Add Show</button></div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">Schedule List</div></div><div class="card-body p-0" id="sListWrap">${skeletonTable}</div></div>
    `;
    loadSchedule();
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
      <div class="card">
        <div class="card-header"><div class="card-title">Station Details</div></div>
        <div class="card-body">
          <div class="form-row"><div class="form-group"><label class="form-label">Station Name</label><input class="form-input" id="name"/></div><div class="form-group"><label class="form-label">Tagline</label><input class="form-input" id="tagline"/></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Website</label><input class="form-input" id="website"/></div><div class="form-group"><label class="form-label">Station ID</label><input class="form-input" id="stationId"/></div></div>
          <div class="form-group"><label class="form-label">About</label><textarea class="form-textarea" id="aboutText"></textarea></div>
          <div class="form-group"><label class="form-label">Footer Text</label><input class="form-input" id="footerText"/></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Contact Information</div></div>
        <div class="card-body">
          <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="cEmail"/></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="cPhone"/></div><div class="form-group"><label class="form-label">WhatsApp</label><input class="form-input" id="cWhatsapp"/></div></div>
        </div>
      </div>
    `;
    fillForm(cfg);
  } else if (key === 'urls') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Stream & Data Endpoints</div></div>
        <div class="card-body">
          <div class="form-row"><div class="form-group"><label class="form-label">Stream URL</label><input class="form-input" id="streamUrl"/></div><div class="form-group"><label class="form-label">Now Playing URL</label><input class="form-input" id="nowPlayingUrl"/></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Schedule Events URL</label><input class="form-input" id="scheduleEventsUrl"/></div><div class="form-group"><label class="form-label">Schedule Week URL</label><input class="form-input" id="scheduleWeekUrl"/></div></div>
          <div class="form-row"><div class="form-group"><label class="form-label">Listener Map URL</label><input class="form-input" id="listenerMapUrl"/></div><div class="form-group"><label class="form-label">Country Stats URL</label><input class="form-input" id="countryStatsUrl"/></div></div>
        </div>
      </div>
    `;
    fillForm(cfg);
  } else if (key === 'branding') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">App Assets</div></div>
        <div class="card-body">
          <div class="form-row"><div class="form-group"><label class="form-label">App Logo URL</label><input class="form-input" id="logoUrl"/></div><div class="form-group"><label class="form-label">App Splash URL</label><input class="form-input" id="splashUrl"/></div></div>
          <div class="form-group"><label class="form-label">Upload App Image</label><input class="form-input" type="file" id="uploadFile" accept="image/png,image/jpeg,image/webp"/></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">App Theme Colors</div></div>
        <div class="card-body">
          <div class="form-row"><div class="form-group"><label class="form-label">Primary Color</label><input class="form-input" type="color" id="primary" style="height:44px;padding:4px"/></div><div class="form-group"><label class="form-label">Accent Color</label><input class="form-input" type="color" id="accent" style="height:44px;padding:4px"/></div></div>
        </div>
      </div>
    `;
    fillForm(cfg);
    $('uploadFile').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/uploads/image', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error); $('logoUrl').value = j.url; toast('Uploaded successfully'); } catch (err) { toast(err.message, 'error'); } finally { $('uploadFile').value = ''; }
    });
  } else if (key === 'seo') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Search Engine Optimization</div></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Meta Description</label><textarea class="form-textarea" id="seoDesc" placeholder="Brief description of the station..."></textarea></div>
          <div class="form-group"><label class="form-label">Meta Keywords</label><input class="form-input" id="seoKeywords" placeholder="radio, music, live, etc"/></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Legal Pages</div></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Terms of Service</label><textarea class="form-textarea" id="legalTerms"></textarea></div>
          <div class="form-group"><label class="form-label">Privacy Policy</label><textarea class="form-textarea" id="legalPrivacy"></textarea></div>
          <div class="form-group"><label class="form-label">Copyright Notice</label><input class="form-input" id="legalCopyright" placeholder="© 2026 Radio Station. All rights reserved."/></div>
        </div>
      </div>
    `;
    fillForm(cfg);
  } else if (key === 'adminBrand') {
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-header-content"><div class="card-title">Admin Dashboard Branding</div><div class="card-subtitle">Customize the appearance of this backend console</div></div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Dashboard Name</label><input class="form-input" id="adminName" placeholder="e.g. Studio Console"/></div>
            <div class="form-group"><label class="form-label">Admin Logo URL</label><input class="form-input" id="adminLogoUrl" placeholder="https://..."/></div>
          </div>
          <div class="form-group"><label class="form-label">Upload Admin Logo</label><input class="form-input" type="file" id="uploadAdminLogo" accept="image/png,image/jpeg,image/webp"/></div>
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
    const opts = roles.map(r => `<option value="${r.id}">${escHtml(r.name)}</option>`).join('');
    c.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-header-content"><div class="card-title">Role Management</div><div class="card-subtitle">Select a role to edit or create a new one</div></div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Select Role</label><select class="form-select" id="rSel" onchange="editRole()"><option value="">(Create New Role)</option>${opts}</select></div>
            <div class="form-group"><label class="form-label">Role Name</label><input class="form-input" id="rName"/></div>
          </div>
          <div class="form-group"><label class="form-label">Permissions</label><div class="perm-grid" id="pGrid"></div></div>
        </div>
        <div class="card-footer"><button class="btn" onclick="newRole()">Clear</button><button class="btn btn-danger-outline" onclick="delRole()">Delete</button><button class="btn btn-primary" onclick="saveRole()">Save Role</button></div>
      </div>
    `;
    editRole();
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
      <div class="card">
        <div class="card-header"><div class="card-title">${isPlayer?'Player Configuration':'MediaCP Integration'}</div></div>
        <div class="card-body">
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
            <div class="form-group"><label class="form-label">Server ID</label><input class="form-input" type="number" id="mcpServerId"/></div>
          </div>
          `}
        </div>
      </div>
    `;
    fillForm(cfg);
  }
}

/* ── Data Loaders & Renderers ── */
async function loadDashboardData() {
  try {
    const [np, ps, msgs, act] = await Promise.allSettled([api('/api/stream/now-playing'), api('/api/push/stats'), api('/api/contact'), api('/api/activity?limit=5')]);
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
      const el = $('dashAct'); if (el) el.innerHTML = trs || '<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">✓</div><div class="empty-text">No recent activity</div></div></td></tr>';
    }
  } catch {}
}

async function loadSchedule() {
  try {
    const r = await api('/api/schedule/all'); const ls = r.data || [];
    const html = ls.map(s => `<tr><td><strong>${escHtml(s.title)}</strong><span class="td-meta">${escHtml(s.description || '')}</span></td><td>${typeof s.dayOfWeek === 'number' ? DAYS[s.dayOfWeek] : (s.dayOfWeek || '')} ${escHtml(s.startTime)}-${escHtml(s.endTime)}</td><td>${escHtml(s.host)}</td><td><button class="btn btn-sm btn-danger-outline" onclick="delShow('${s.id}')">Delete</button></td></tr>`).join('');
    const el = $('sListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Show</th><th>Schedule</th><th>Host</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">No shows scheduled</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function loadPodcasts() {
  try {
    const r = await api('/api/podcasts/all'); const ls = r.data || [];
    const html = ls.map(p => `<tr><td><strong>${escHtml(p.title)}</strong></td><td>${escHtml(p.host)}<span class="td-meta">${escHtml(p.category)}</span></td><td><span class="badge ${p.isPublished ? 'badge-success' : 'badge-warning'}">${p.isPublished ? 'Published' : 'Draft'}</span></td><td><button class="btn btn-sm btn-danger-outline" onclick="delPod('${p.id}')">Delete</button></td></tr>`).join('');
    const el = $('pListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Episode</th><th>Host / Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">🎙️</div><div class="empty-text">No podcasts found</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function loadMessages() {
  try {
    const r = await api('/api/contact'); const ls = r.messages || [];
    const html = ls.map(m => `<tr><td><strong>${escHtml(m.name)}</strong><span class="td-meta">${escHtml(m.email)}</span></td><td style="max-width:400px;white-space:normal">${escHtml(m.message)}</td><td>${fmtDate(m.createdAt)}</td><td><div class="btn-group">${m.isRead ? '' : `<button class="btn btn-sm" onclick="readMsg('${m.id}')">Mark Read</button>`}<button class="btn btn-sm btn-danger-outline" onclick="delMsg('${m.id}')">Delete</button></div></td></tr>`).join('');
    const el = $('mListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Sender</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">📨</div><div class="empty-text">Inbox is empty</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function loadActivity() {
  try {
    const r = await api('/api/activity?limit=50'); const ls = r.entries || [];
    const html = ls.map(e => `<tr><td><strong>${escHtml(e.action)}</strong></td><td>${escHtml(e.email || '—')}</td><td>${escHtml(e.details || '—')}</td><td class="td-meta">${fmtDate(e.timestamp)}</td></tr>`).join('');
    const el = $('aListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Action</th><th>User</th><th>Details</th><th>Time</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">⏱️</div><div class="empty-text">No activity yet</div></div>';
  } catch (e) { toast(e.message, 'error'); }
}

function renderUsers() {
  const html = users.map(u => {
    const n = (u.firstName || u.lastName) ? `${u.firstName} ${u.lastName}`.trim() : '—';
    const a = u.avatarUrl ? `<img src="${escHtml(u.avatarUrl)}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px"/>` : `<span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--bg);color:var(--text);text-align:center;line-height:24px;margin-right:8px;font-size:11px;font-weight:700">${u.email[0].toUpperCase()}</span>`;
    return `<tr><td><div style="display:flex;align-items:center">${a}<div><strong>${escHtml(u.email)}</strong><span class="td-meta">${escHtml(n)} ${u.company?`• ${escHtml(u.company)}`:''}</span></div></div></td><td><span class="badge badge-neutral">${escHtml(u.roleName)}</span></td><td><span class="badge ${u.disabled ? 'badge-danger' : 'badge-success'}"><span class="dot ${u.disabled?'dot-red':'dot-green'}"></span>${u.disabled ? 'Disabled' : 'Active'}</span></td><td><button class="btn btn-sm btn-danger-outline" onclick="delUser('${u.id}')">Delete</button></td></tr>`;
  }).join('');
  const el = $('uListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-text">No users</div></div>';
}

function renderInvites() {
  const ls = invites.filter(i => !i.usedAt && !i.revokedAt && (!i.expiresAt || Date.now() < i.expiresAt));
  const html = ls.map(i => `<tr><td>${escHtml(i.email || 'Any')}</td><td><span class="badge badge-neutral">${escHtml(i.roleName)}</span></td><td>${fmtDate(i.expiresAt)}</td><td><button class="btn btn-sm btn-danger-outline" onclick="revInvite('${i.id}')">Revoke</button></td></tr>`).join('');
  const el = $('iListWrap'); if (el) el.innerHTML = html ? `<div class="table-wrap"><table><thead><tr><th>Target Email</th><th>Role</th><th>Expires</th><th>Actions</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">✉️</div><div class="empty-text">No active invites</div></div>';
}

window.editRole = function() {
  const id = $('rSel')?.value; roleEditId = id || '';
  const r = roles.find(x => x.id === id);
  if ($('rName')) $('rName').value = r ? r.name : '';
  const sel = new Set(r ? r.permissions : []);
  if ($('pGrid')) $('pGrid').innerHTML = perms.map(p => `<label class="perm-item"><input type="checkbox" id="p_${p}" ${sel.has(p) ? 'checked' : ''}/><span class="perm-name">${p}</span></label>`).join('');
};
window.newRole = function() { if ($('rSel')) $('rSel').value = ''; editRole(); };

/* ── Actions ── */
window.mcpAction = async (act) => { try { const r = await api('/api/mediacp/' + act, { method: 'POST', body: '{}' }); if ($('mcpRes')) { show($('mcpRes')); $('mcpRes').textContent = JSON.stringify(r, null, 2); } toast('Action successful'); } catch (e) { toast(e.message, 'error'); } };
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
window.delRole = async () => { if (!roleEditId) return; try { await api('/api/roles/' + roleEditId, { method: 'DELETE' }); await loadRoles(); switchTab('roles'); toast('Role deleted'); } catch (e) { toast(e.message, 'error'); } };
window.addInvite = async () => { try { const r = await api('/api/invites', { method: 'POST', body: JSON.stringify({ email: $('iEmail').value, roleId: $('iRole').value, expiresInDays: Number($('iDays').value) || 7 }) }); $('iEmail').value = ''; $('iOut').innerHTML = `<a href="${r.inviteUrl}" target="_blank">${r.inviteUrl}</a>`; await loadInvites(); renderInvites(); toast('Invite created'); } catch (e) { toast(e.message, 'error'); } };
window.revInvite = async (id) => { try { await api('/api/invites/' + id + '/revoke', { method: 'POST', body: '{}' }); await loadInvites(); renderInvites(); toast('Revoked'); } catch (e) { toast(e.message, 'error'); } };

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

if($('reloadBtn')) $('reloadBtn').addEventListener('click', async () => { try { await loadAll(); switchTab('dashboard'); toast('Reloaded'); } catch (e) { toast(e.message, 'error'); } });
if($('saveBtn')) $('saveBtn').addEventListener('click', async () => {
  try { setStatus('Saving...'); await api('/api/config', { method: 'PUT', body: JSON.stringify(readForm()) }); toast('Configuration saved!'); setStatus('Saved'); applyAdminBranding(); }
  catch (e) { toast(e.message, 'error'); setStatus('Error'); }
});

/* ── Init ── */
(async () => {
  const params = new URLSearchParams(location.search || '');
  inviteToken = params.get('token') || '';
  if (inviteToken) { show($('invitePage')); return; }
  try {
    const r = await api('/api/me'); me = r.user;
    hide($('loginPage')); show($('app'));
    if(typeof updateProfileUI === 'function') updateProfileUI();
    
    if (!hasPerm('users:read')) hide($('usersNav'));
    if (!hasPerm('roles:read')) hide($('rolesNav'));
    if (!hasPerm('invites:read')) hide($('invitesNav'));
    if (!hasPerm('activity:read')) hide($('activityNav'));
    
    await loadAll(); switchTab('dashboard');
  } catch (e) { show($('loginPage')); }
})();
