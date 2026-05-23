const $ = id => document.getElementById(id);
let me = null, cfg = null, roles = [], perms = [], users = [], invites = [], roleEditId = '', inviteToken = '';
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Daily'];

function setStatus(m) { const el = $('statusBadge'); if(el) el.textContent = m; }
function show(el) { if(el) el.classList.remove('hide'); }
function hide(el) { if(el) el.classList.add('hide'); }

let toastTimer;
function toast(msg, type='success') {
  const container = $('toastContainer');
  if(!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<div class="toast-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${type==='success'?'M20 6L9 17l-5-5':'M18 6L6 18M6 6l12 12'}"/></svg></div><div>${escHtml(msg)}</div>`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

async function api(path, opts) {
  const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {}));
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && json.error) || ('HTTP ' + res.status));
  return json;
}

function hasPerm(p) { return me && Array.isArray(me.permissions) && me.permissions.includes(p); }

function switchTab(key) {
  document.querySelectorAll('#navMenu .nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === key));
  const titles = { dashboard: 'Dashboard', stream: 'Stream Control', schedule: 'Schedule', podcasts: 'Podcasts', push: 'Notifications', messages: 'Messages', general: 'Station Details', urls: 'Stream URLs', branding: 'Branding & App', seo: 'SEO & Legal', mcpConfig: 'MediaCP API', adminBrand: 'Admin Branding', users: 'Users', roles: 'Roles', invites: 'Invites', activity: 'Audit Log' };
  const el = $('pageTitle'); if(el) el.textContent = titles[key] || key;
  renderTab(key);
  const sb = $('sidebar'); if(sb) sb.classList.remove('open');
}

document.querySelectorAll('#navMenu .nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
const hamburger = $('hamburger'); if(hamburger) hamburger.addEventListener('click', () => $('sidebar').classList.toggle('open'));

function readForm() {
  const v = id => { const el = $(id); return el ? el.value : ''; };
  return {
    name: v('name'), tagline: v('tagline'), footerText: v('footerText'), website: v('website'), aboutText: v('aboutText'), stationId: v('stationId'),
    streamUrl: v('streamUrl'), nowPlayingUrl: v('nowPlayingUrl'), scheduleEventsUrl: v('scheduleEventsUrl'), scheduleWeekUrl: v('scheduleWeekUrl'), listenerMapUrl: v('listenerMapUrl'), countryStatsUrl: v('countryStatsUrl'),
    contact: { email: v('cEmail'), phone: v('cPhone'), whatsapp: v('cWhatsapp') },
    branding: { logoUrl: v('logoUrl'), splashUrl: v('splashUrl') },
    theme: { primary: v('primary'), accent: v('accent') },
    player: { metadataRefreshMs: Number(v('metadataRefreshMs'))||15000, reconnectMaxDelayMs: Number(v('reconnectMaxDelayMs'))||10000, reconnectBackoff: Number(v('reconnectBackoff'))||1.5 },
    features: { enableNotifications: v('enableNotifications')==='true', enableSchedule: v('enableSchedule')==='true', enablePodcasts: v('enablePodcasts')==='true' },
    mediacp: { apiKey: v('mcpApiKey'), rpcUrl: v('mcpRpcUrl'), serverId: Number(v('mcpServerId'))||0 },
    adminBranding: { name: v('adminName'), logoUrl: v('adminLogoUrl') },
    seo: { description: v('seoDesc'), keywords: v('seoKeywords') },
    legal: { terms: v('legalTerms'), privacy: v('legalPrivacy'), copyright: v('legalCopyright') }
  };
}

function applyAdminBranding() {
  const n = cfg?.adminBranding?.name || 'Radio Admin';
  const l = cfg?.adminBranding?.logoUrl || '';
  
  if($('sidebarTitle')) $('sidebarTitle').textContent = n;
  if($('loginTitle')) $('loginTitle').textContent = n;
  if($('inviteTitle')) $('inviteTitle').textContent = n;
  if($('docTitle')) $('docTitle').textContent = n + ' Console';
  
  const setLogo = (id, url) => {
    const el = $(id);
    if(!el) return;
    if(url) { el.src = url; show(el); }
    else { hide(el); }
  };
  setLogo('sidebarLogo', l);
  setLogo('loginLogo', l);
  setLogo('inviteLogo', l);
  if($('sidebarLogoFallback')) { if(l) hide($('sidebarLogoFallback')); else show($('sidebarLogoFallback')); }
}

function fillForm(c) {
  cfg = c || {}; 
  const s = (id, val) => { const el = $(id); if(el) el.value = val || ''; };
  s('name', cfg.name); s('tagline', cfg.tagline); s('footerText', cfg.footerText); s('website', cfg.website); s('aboutText', cfg.aboutText); s('stationId', cfg.stationId);
  s('streamUrl', cfg.streamUrl); s('nowPlayingUrl', cfg.nowPlayingUrl); s('scheduleEventsUrl', cfg.scheduleEventsUrl); s('scheduleWeekUrl', cfg.scheduleWeekUrl); s('listenerMapUrl', cfg.listenerMapUrl); s('countryStatsUrl', cfg.countryStatsUrl);
  s('logoUrl', cfg.branding?.logoUrl); s('splashUrl', cfg.branding?.splashUrl);
  s('primary', cfg.theme?.primary || '#2563eb'); s('accent', cfg.theme?.accent || '#059669');
  s('metadataRefreshMs', cfg.player?.metadataRefreshMs || 15000); s('reconnectMaxDelayMs', cfg.player?.reconnectMaxDelayMs || 10000); s('reconnectBackoff', cfg.player?.reconnectBackoff || 1.5);
  s('enableNotifications', String(cfg.features?.enableNotifications !== false)); s('enableSchedule', String(cfg.features?.enableSchedule !== false)); s('enablePodcasts', String(!!cfg.features?.enablePodcasts));
  s('mcpRpcUrl', cfg.mediacp?.rpcUrl); s('mcpApiKey', cfg.mediacp?.apiKey); s('mcpServerId', cfg.mediacp?.serverId || 0);
  s('cEmail', cfg.contact?.email); s('cPhone', cfg.contact?.phone); s('cWhatsapp', cfg.contact?.whatsapp);
  
  s('adminName', cfg.adminBranding?.name); s('adminLogoUrl', cfg.adminBranding?.logoUrl);
  s('seoDesc', cfg.seo?.description); s('seoKeywords', cfg.seo?.keywords);
  s('legalTerms', cfg.legal?.terms); s('legalPrivacy', cfg.legal?.privacy); s('legalCopyright', cfg.legal?.copyright);
  
  applyAdminBranding();
}

async function loadAll() {
  setStatus('Loading...');
  try {
    const r = await api('/api/config'); fillForm(r.data);
    if(hasPerm('roles:read')) { await loadPerms(); await loadRoles(); }
    if(hasPerm('users:read')) await loadUsers();
    if(hasPerm('invites:read')) await loadInvites();
    setStatus('Ready');
  } catch(e) { setStatus(e.message); }
}

async function loadPerms() { const r = await api('/api/roles/permissions'); perms = r.permissions || []; }
async function loadRoles() { const r = await api('/api/roles'); roles = r.roles || []; }
async function loadUsers() { const r = await api('/api/users'); users = r.users || []; }
async function loadInvites() { const r = await api('/api/invites'); invites = r.invites || []; }

function fmtDate(ts) { if(!ts) return '—'; const d = new Date(ts); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ── Profile Drawer ── */
function updateProfileUI() {
  if(!me) return;
  const name = (me.firstName || me.lastName) ? `${me.firstName} ${me.lastName}`.trim() : me.email.split('@')[0];
  if($('userFullName')) $('userFullName').textContent = name;
  if($('userRole')) $('userRole').textContent = me.role?.name || 'User';
  
  const ava = $('userAvatar');
  if(ava) {
    if(me.avatarUrl) { ava.innerHTML = `<img src="${escHtml(me.avatarUrl)}" alt="Avatar"/>`; }
    else { ava.textContent = name.charAt(0).toUpperCase(); }
  }
}

if($('profileTrigger')) {
  $('profileTrigger').addEventListener('click', () => {
    $('profileFirstName').value = me.firstName || '';
    $('profileLastName').value = me.lastName || '';
    $('profileCompany').value = me.company || '';
    $('profileTimezone').value = me.timezone || '';
    $('profilePassword').value = '';
    const prev = $('drawerAvatarPreview');
    if(me.avatarUrl) prev.innerHTML = `<img src="${escHtml(me.avatarUrl)}" alt="Avatar"/>`;
    else prev.textContent = me.firstName ? me.firstName.charAt(0).toUpperCase() : me.email.charAt(0).toUpperCase();
    
    show($('drawerOverlay'));
    $('profileDrawer').classList.add('show');
  });
}

function closeDrawer() {
  hide($('drawerOverlay'));
  $('profileDrawer').classList.remove('show');
}
if($('closeDrawerBtn')) $('closeDrawerBtn').addEventListener('click', closeDrawer);
if($('cancelProfileBtn')) $('cancelProfileBtn').addEventListener('click', closeDrawer);
if($('drawerOverlay')) $('drawerOverlay').addEventListener('click', closeDrawer);

if($('profileAvatarUpload')) {
  $('profileAvatarUpload').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0]; if(!f) return;
    try {
      const fd = new FormData(); fd.append('file', f);
      const r = await fetch('/api/uploads/image', { method: 'POST', body: fd });
      const j = await r.json(); if(!r.ok) throw new Error(j.error);
      me.avatarUrl = j.url;
      $('drawerAvatarPreview').innerHTML = `<img src="${escHtml(j.url)}" alt="Avatar"/>`;
      toast('Avatar uploaded temporarily. Save profile to keep it.');
    } catch(err) { toast(err.message, 'error'); }
    finally { $('profileAvatarUpload').value = ''; }
  });
}

if($('saveProfileBtn')) {
  $('saveProfileBtn').addEventListener('click', async () => {
    try {
      const payload = {
        firstName: $('profileFirstName').value,
        lastName: $('profileLastName').value,
        company: $('profileCompany').value,
        timezone: $('profileTimezone').value,
        avatarUrl: me.avatarUrl,
        password: $('profilePassword').value
      };
      await api('/api/users/me/profile', { method: 'PUT', body: JSON.stringify(payload) });
      me = { ...me, ...payload };
      delete me.password;
      updateProfileUI();
      closeDrawer();
      toast('Profile updated successfully');
    } catch(e) { toast(e.message, 'error'); }
  });
}
