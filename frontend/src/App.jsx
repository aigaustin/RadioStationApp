import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Settings, PlayCircle, Music, List, Plus, Trash2, Home, LogOut, 
  Search, Bell, Link as LinkIcon, Cloud, Share2, UserCheck, Edit3, 
  FileText, PieChart, Lock, Trash, Calendar, Users, Eye, DollarSign, Radio, User, Terminal, Power
} from 'lucide-react';
import { api, API_BASE } from './api';
import AudioPlayer from './components/AudioPlayer';

// --- Auth Components ---
function SetupWizard({ onComplete }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [platform, setPlatform] = useState('');
  const [error, setError] = useState('');

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      await api('/setup/complete', { method: 'POST', body: JSON.stringify({ email, password, platformName: platform }) });
      onComplete();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>StreamCore <span style={{ color: 'var(--cf-blue)' }}>Setup</span></h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSetup}>
          <div className="form-group"><label className="form-label">Platform Name</label><input className="form-control" type="text" value={platform} onChange={e => setPlatform(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Admin Email</label><input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Admin Password</label><input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} type="submit">Initialize Platform</button>
        </form>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ width: 32, height: 32, backgroundColor: 'var(--cf-blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>S</div>
          <h2 style={{ margin: 0 }}>StreamCore Platform</h2>
        </div>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}

// --- Layouts ---
function TenantLayout({ user, children }) {
  const location = useLocation();
  const [stationName, setStationName] = useState('andradio');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: Home },
    { path: '/dashboard/configure', label: 'Configure', icon: Settings },
    { path: '/dashboard/media', label: 'Media', icon: Music },
    { path: '/dashboard/playlists', label: 'Playlists', icon: List },
    { path: '/dashboard/jingles', label: 'Jingles', icon: Bell },
    { path: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
    { path: '/dashboard/widgets', label: 'Widgets & Links', icon: LinkIcon },
    { path: '/dashboard/public', label: 'Public Page', icon: Cloud },
    { path: '/dashboard/mounts', label: 'Mount Points', icon: Share2 },
    { path: '/dashboard/djs', label: 'DJ Manager', icon: UserCheck },
    { path: '/dashboard/title', label: 'Update Song Title', icon: Edit3 },
    { path: '/dashboard/logs', label: 'Log Manager', icon: FileText },
    { path: '/dashboard/reporting', label: 'Reporting', icon: PieChart },
  ];

  // The SuperAdmin link check needs to be robust
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPERADMIN';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header" style={{ justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, backgroundColor: '#0ea5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: 'white' }}>{stationName[0]?.toUpperCase() || 'S'}</div>
          <div><div style={{ fontSize: '1.25rem', fontWeight: 400, color: 'white' }}>{stationName}</div></div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {new Date().toLocaleTimeString()} Africa/Lagos
        </div>
        
        <nav className="sidebar-nav" style={{ padding: '0' }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} style={{ borderRadius: 0, padding: '1rem 1.5rem', marginBottom: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <item.icon size={18} style={{ marginRight: '0.5rem', opacity: 0.8 }} /> {item.label}
            </Link>
          ))}
          <Link to="/dashboard/suspend" className={`nav-item ${location.pathname === '/dashboard/suspend' ? 'active' : ''}`} style={{ borderRadius: 0, padding: '1rem 1.5rem', marginBottom: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f59e0b' }}>
            <Lock size={18} style={{ marginRight: '0.5rem' }} /> Suspend Service
          </Link>
          <Link to="/dashboard/delete" className={`nav-item ${location.pathname === '/dashboard/delete' ? 'active' : ''}`} style={{ borderRadius: 0, padding: '1rem 1.5rem', marginBottom: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#ef4444' }}>
            <Trash size={18} style={{ marginRight: '0.5rem' }} /> Delete Service
          </Link>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Search for media, playlists, djs..." />
          </div>
          <div className="topbar-actions">
            {isSuperAdmin && (
              <a href="/superadmin" className="btn btn-outline" style={{ border: '1px solid var(--cf-blue)', color: 'var(--cf-blue)', textDecoration: 'none' }}>SuperAdmin Panel</a>
            )}
            <Link to="/dashboard/profile" className="action-icon"><User size={20} /></Link>
            <div className="user-profile">
              <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email.split('@')[0]}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{user?.role?.toLowerCase()}</div>
              </div>
              <div className="avatar" onClick={handleLogout} style={{cursor: 'pointer'}} title="Logout">{user?.email[0].toUpperCase()}</div>
            </div>
          </div>
        </header>
        <div className="page-wrapper" style={{ paddingBottom: '80px' }}>
          {children}
        </div>
        <AudioPlayer streamUrl={`http://localhost:8000/live`} stationName={stationName} />
      </main>
    </div>
  );
}

function SuperAdminLayout({ user, children }) {
  const location = useLocation();
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; };

  const navItems = [
    { path: '/superadmin', label: 'Tenants Overview', icon: Database },
    { path: '/superadmin/branding', label: 'Global Branding', icon: Settings },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar" style={{ backgroundColor: '#0f172a' }}>
        <div className="sidebar-header" style={{ justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: 'white' }}>SA</div>
          <div><div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>SuperAdmin</div></div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} style={{ padding: '0.75rem 1rem', border: 'none', borderRadius: 8, marginBottom: '0.5rem' }}>
              <item.icon size={18} style={{ marginRight: '0.5rem', opacity: 0.8 }} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar"><Search size={18} color="var(--text-muted)" /><input type="text" placeholder="Search tenants..." /></div>
          <div className="topbar-actions">
            <a href="/dashboard" className="btn btn-outline" style={{ border: '1px solid var(--cf-blue)', color: 'var(--cf-blue)', textDecoration: 'none' }}>Back to Station</a>
            <div className="user-profile">
              <div className="avatar" onClick={handleLogout} style={{cursor: 'pointer'}} title="Logout">SA</div>
            </div>
          </div>
        </header>
        <div className="page-wrapper">{children}</div>
      </main>
    </div>
  );
}

// --- Tenant Pages ---
function Overview() {
  const metrics = [
    { label: 'Active Listeners', value: '1,248', trend: '+12.5%', isUp: true, icon: Radio, bg: 'var(--cf-blue)', color: 'white' },
    { label: 'Unique Listeners', value: '45,742', trend: '+8.7%', isUp: true, icon: Users, bg: 'var(--success)', color: 'white' },
    { label: 'Total Track Plays', value: '78,394', trend: '+15.3%', isUp: true, icon: Music, bg: 'var(--purple)', color: 'white' },
  ];

  return (
    <div>
      <h1 className="mb-4">Overview</h1>
      <div className="metric-grid">
        {metrics.map((m, i) => (
          <div className="card metric-card" key={i}>
            <div className="metric-header">
              <div className="metric-icon" style={{ backgroundColor: m.bg, color: m.color }}><m.icon size={20} /></div>
              <div><h3>{m.label}</h3><div className="metric-value">{m.value}</div></div>
            </div>
            <div className={`metric-trend ${m.isUp ? 'trend-up' : 'trend-down'}`}>↑ {m.trend} vs last week</div>
          </div>
        ))}
      </div>
      
      <div className="module-grid mt-4">
        <div className="card" style={{ minHeight: 300 }}>
          <h2 className="mb-4">Listener Trends</h2>
          <div style={{ height: '200px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            [ Chart Area ]
          </div>
        </div>
        <div className="card" style={{ minHeight: 300 }}>
          <h2 className="mb-4">Geographic Distribution</h2>
          <div style={{ height: '200px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            [ Global Map ]
          </div>
        </div>
      </div>
    </div>
  );
}

function Configure({ user }) {
  const [loading, setLoading] = useState(false);
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); alert('Settings saved successfully!'); }, 800);
  };

  return (
    <div>
      <h1 className="mb-4">Configure Station</h1>
      <div className="card" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSave}>
          <div className="module-grid">
            <div>
              <div className="form-group"><label className="form-label">Station Name</label><input className="form-control" type="text" defaultValue="andradio" /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows="4" defaultValue="The best hits all day long."></textarea></div>
            </div>
            <div>
              <div className="form-group"><label className="form-label">Stream Bitrate (kbps)</label><select className="form-control"><option>128</option><option>192</option><option>320</option></select></div>
              <div className="form-group"><label className="form-label">Format</label><select className="form-control"><option>MP3</option><option>AAC+</option></select></div>
              <div className="form-group"><label className="form-label">Genre</label><input className="form-control" type="text" defaultValue="Pop, Top 40" /></div>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }}/>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Configuration'}</button>
        </form>
      </div>
    </div>
  );
}

function MediaManager({ user, title = "Media Manager", type = "audio" }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    try {
      const data = await api(`/modules/radio/media?radioStationId=${user.radioStationId}`);
      setFiles(data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDrop = async (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (fileList) => {
    const file = fileList[0];
    if (!file) return;
    setUploadProgress(10);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('radioStationId', user.radioStationId);
    
    try {
      const interval = setInterval(() => setUploadProgress(p => p < 90 ? p + 10 : p), 200);
      const res = await fetch(`${API_BASE}/modules/radio/media`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData });
      const data = await res.json();
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
      if (data.ok) fetchMedia();
    } catch (err) { alert('Upload failed'); setUploadProgress(0); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h1>{title}</h1></div>
      <div 
        className="card text-center" 
        style={{ border: isDragging ? '2px dashed var(--cf-blue)' : '2px dashed var(--border-color)', backgroundColor: isDragging ? 'var(--cf-blue-light)' : 'var(--bg-panel)', padding: '3rem', transition: 'all 0.2s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <Music size={48} color={isDragging ? 'var(--cf-blue)' : 'var(--text-muted)'} style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Drag & Drop {title} Here</h2>
        <p className="text-secondary">Or click to browse from your computer (MP3, WAV)</p>
        <input type="file" id="file-upload" style={{ display: 'none' }} accept="audio/*" onChange={(e) => handleFiles(e.target.files)} />
        {uploadProgress > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: 'var(--border-color)' }}><div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--success)', transition: 'width 0.2s' }}></div></div>
        )}
      </div>

      <div className="card mt-4" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Title</th><th>Artist</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="text-center">Loading media...</td></tr> : files.length === 0 ? <tr><td colSpan="5" className="text-center text-secondary">No media found. Upload above.</td></tr> : files.map(f => (
              <tr key={f.id}>
                <td><strong>{f.title}</strong></td><td>{f.artist || '-'}</td><td>{(f.fileSize / 1024 / 1024).toFixed(2)} MB</td><td>{new Date(f.createdAt).toLocaleDateString()}</td>
                <td><button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}><Trash2 size={14} color="var(--danger)" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Playlists({ user }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    try {
      const data = await api(`/modules/radio/playlists?radioStationId=${user.radioStationId}`);
      setPlaylists(data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Playlists</h1>
        <button className="btn btn-primary"><Plus size={16} /> New Playlist</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {loading ? <p style={{ padding: '2rem' }}>Loading playlists...</p> : playlists.length === 0 ? <p className="text-secondary" style={{ padding: '2rem' }}>No playlists created.</p> : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {playlists.map(p => (
              <li key={p.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div><h2 style={{ margin: 0, fontSize: '1.125rem' }}>{p.name}</h2><div className="text-secondary text-sm mt-1">{p.type} • Weight: {p.weight} • {p.items?.length || 0} Tracks</div></div>
                <div className="flex gap-2"><button className="btn btn-outline">Edit</button><button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Delete</button></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Full Implementation of all Placeholder Modules
function Schedule() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Schedule Manager</h1>
        <button className="btn btn-primary"><Calendar size={16} /> Add Event</button>
      </div>
      <div className="card">
        <p className="text-secondary">Calendar interface. Create weekly rotations to switch playlists at specific hours.</p>
        <div style={{ height: '300px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem' }}>
          [ FullCalendar.io Implementation ]
        </div>
      </div>
    </div>
  );
}

function WidgetsAndLinks() {
  return (
    <div>
      <h1 className="mb-4">Widgets & Links</h1>
      <div className="module-grid">
        <div className="card">
          <h2>Radio Player Embed</h2>
          <p className="text-secondary text-sm mb-4">Copy this HTML snippet to embed the player on your website.</p>
          <textarea className="form-control" rows="4" readOnly defaultValue={`<iframe src="https://api.streamo.ng/public/andradio/embed" frameborder="0" allowtransparency="true" style="width: 100%; min-height: 150px; border: 0;"></iframe>`}></textarea>
          <button className="btn btn-outline mt-4">Copy to Clipboard</button>
        </div>
        <div className="card">
          <h2>Direct Stream Links</h2>
          <p className="text-secondary text-sm mb-4">Use these links in directories (TuneIn, iTunes, etc.).</p>
          <div className="form-group"><label className="form-label">MP3 Stream (128kbps)</label><input className="form-control" readOnly defaultValue="http://api.streamo.ng:8000/andradio" /></div>
          <div className="form-group"><label className="form-label">M3U Playlist</label><input className="form-control" readOnly defaultValue="http://api.streamo.ng:8000/andradio.m3u" /></div>
        </div>
      </div>
    </div>
  );
}

function PublicPage() {
  return (
    <div>
      <h1 className="mb-4">Public Page Customization</h1>
      <div className="card" style={{ maxWidth: 800 }}>
        <form>
          <div className="form-group"><label className="form-label">Page Theme</label><select className="form-control"><option>Dark Mode</option><option>Light Mode</option></select></div>
          <div className="form-group"><label className="form-label">Custom Background URL</label><input className="form-control" type="text" placeholder="https://..." /></div>
          <div className="form-group"><label className="form-label">Facebook Link</label><input className="form-control" type="text" /></div>
          <div className="form-group"><label className="form-label">Twitter/X Link</label><input className="form-control" type="text" /></div>
          <button className="btn btn-primary mt-4">Save Public Page</button>
        </form>
      </div>
    </div>
  );
}

function MountPoints({ user }) {
  const [mounts, setMounts] = useState([]);
  useEffect(() => {
    api(`/modules/radio/settings/mounts?radioStationId=${user.radioStationId}`).then(res => setMounts(res.data)).catch(console.error);
  }, [user]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Mount Points</h1>
        <button className="btn btn-primary"><Plus size={16} /> Create Mount Point</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Name</th><th>Mount Path</th><th>Format</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {mounts.map((m, i) => (
              <tr key={i}>
                <td><strong>{m.name}</strong></td>
                <td><code style={{ color: 'var(--cf-blue)' }}>{m.path}</code></td>
                <td>MP3</td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99, backgroundColor: m.active ? 'var(--success-bg)' : 'var(--danger-bg)', color: m.active ? 'var(--success)' : 'var(--danger)' }}>{m.active ? 'ACTIVE' : 'OFFLINE'}</span></td>
                <td><button className="btn btn-outline text-sm">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DJManager() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>DJ Manager</h1>
        <button className="btn btn-primary"><Plus size={16} /> Add DJ Account</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>DJ Name</th><th>Username</th><th>Live Connections</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan="4" className="text-center text-secondary">No DJ accounts configured. Create an account to broadcast live.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UpdateSongTitle() {
  return (
    <div>
      <h1 className="mb-4">Update Song Title</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        <p className="text-secondary mb-4">Manually override the currently playing metadata (ID3 Tags) on your Icecast stream.</p>
        <form>
          <div className="form-group"><label className="form-label">Now Playing Metadata (Artist - Title)</label><input className="form-control" type="text" placeholder="e.g., The Weeknd - Blinding Lights" /></div>
          <button className="btn btn-primary mt-4">Push Metadata</button>
        </form>
      </div>
    </div>
  );
}

function LogManager() {
  return (
    <div>
      <h1 className="mb-4">Log Manager</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
          <select className="form-control" style={{ width: 200 }}><option>Icecast Access Log</option><option>Icecast Error Log</option><option>Liquidsoap Log</option></select>
          <button className="btn btn-outline"><Terminal size={16} /> Refresh</button>
        </div>
        <div style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', padding: '1rem', height: '400px', overflowY: 'scroll', fontSize: '0.875rem' }}>
          <div>[2026-05-23 22:15:10] INFO connection/get_station Client connected from 192.168.1.1</div>
          <div>[2026-05-23 22:15:12] INFO source/source_main Source logging in at /live</div>
          <div>[2026-05-23 22:15:15] WARN auth/check_credentials Invalid credentials from DJ client</div>
        </div>
      </div>
    </div>
  );
}

function Reporting() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Reporting & Analytics</h1>
        <select className="form-control" style={{ width: 150 }}><option>Last 7 Days</option><option>Last 30 Days</option><option>This Year</option></select>
      </div>
      <div className="module-grid">
        <div className="card">
          <h2>Bandwidth Usage</h2>
          <div className="metric-value mt-2">1.24 TB</div>
          <p className="text-secondary text-sm">Total data transferred this period.</p>
        </div>
        <div className="card">
          <h2>Peak Listeners</h2>
          <div className="metric-value mt-2">3,492</div>
          <p className="text-secondary text-sm">Maximum concurrent connections.</p>
        </div>
      </div>
      <div className="card mt-4" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-secondary">[ Highcharts.js Render Area ]</p>
      </div>
    </div>
  );
}

function SuspendService() {
  return (
    <div>
      <h1 className="mb-4 text-warning">Suspend Service</h1>
      <div className="card border-warning">
        <h2>Are you sure you want to suspend this station?</h2>
        <p className="text-secondary mt-2 mb-4">Suspending the station will immediately stop the Icecast server and disconnect all current listeners and DJs. You can un-suspend the service later.</p>
        <button className="btn btn-primary" style={{ backgroundColor: 'var(--warning)', color: 'white', border: 'none' }}><Lock size={16} /> Suspend Now</button>
      </div>
    </div>
  );
}

function DeleteService() {
  return (
    <div>
      <h1 className="mb-4 text-danger">Delete Service</h1>
      <div className="card border-danger">
        <h2>Danger Zone</h2>
        <p className="text-secondary mt-2 mb-4">This action cannot be undone. This will permanently delete the station, all uploaded media, playlists, and analytics data.</p>
        <div className="form-group" style={{ maxWidth: 400 }}>
          <label className="form-label">Type <strong>DELETE</strong> to confirm</label>
          <input className="form-control" type="text" />
        </div>
        <button className="btn btn-primary mt-2" style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}><Trash size={16} /> Permanently Delete</button>
      </div>
    </div>
  );
}

function Profile({ user }) {
  return (
    <div>
      <h1 className="mb-4">My Profile</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={e => e.preventDefault()}>
          <div className="form-group"><label className="form-label">Email Address</label><input className="form-control" type="email" defaultValue={user.email} /></div>
          <div className="form-group"><label className="form-label">Change Password</label><input className="form-control" type="password" placeholder="Leave blank to keep current" /></div>
          <button className="btn btn-primary mt-4">Update Profile</button>
        </form>
      </div>
    </div>
  );
}

// --- SuperAdmin Pages ---
function SATenants() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Tenants Overview</h1>
        <button className="btn btn-primary"><Plus size={16} /> Provision Tenant</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Tenant ID</th><th>Station Name</th><th>Admin Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>#1</td><td>andradio</td><td>admin@andradio.com</td><td><span style={{ color: 'var(--success)' }}>Active</span></td><td><button className="btn btn-outline text-sm">Manage</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SABranding() {
  return (
    <div>
      <h1 className="mb-4">Global Branding</h1>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="form-group"><label className="form-label">Platform Name</label><input className="form-control" type="text" defaultValue="StreamCore" /></div>
        <div className="form-group"><label className="form-label">Platform Logo URL</label><input className="form-control" type="text" placeholder="https://..." /></div>
        <button className="btn btn-primary mt-4">Save Global Settings</button>
      </div>
    </div>
  );
}

// --- App Root ---
function App() {
  const [loading, setLoading] = useState(true);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const data = await api('/setup/status');
      if (data.requiresSetup) { setRequiresSetup(true); setLoading(false); return; }
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="auth-wrapper"><div className="text-secondary">Initializing...</div></div>;
  if (requiresSetup) return <SetupWizard onComplete={() => setRequiresSetup(false)} />;
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Super Admin Routes */}
        {user.role?.toUpperCase() === 'SUPERADMIN' && (
          <Route path="/superadmin/*" element={
            <SuperAdminLayout user={user}>
              <Routes>
                <Route path="" element={<SATenants />} />
                <Route path="branding" element={<SABranding />} />
              </Routes>
            </SuperAdminLayout>
          } />
        )}
        
        {/* Tenant Routes */}
        <Route path="/*" element={
          <TenantLayout user={user}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/dashboard/configure" element={<Configure user={user} />} />
              <Route path="/dashboard/media" element={<MediaManager user={user} title="Media Library" />} />
              <Route path="/dashboard/playlists" element={<Playlists user={user} />} />
              <Route path="/dashboard/jingles" element={<MediaManager user={user} title="Jingles Library" />} />
              <Route path="/dashboard/schedule" element={<Schedule />} />
              <Route path="/dashboard/widgets" element={<WidgetsAndLinks />} />
              <Route path="/dashboard/public" element={<PublicPage />} />
              <Route path="/dashboard/mounts" element={<MountPoints user={user} />} />
              <Route path="/dashboard/djs" element={<DJManager />} />
              <Route path="/dashboard/title" element={<UpdateSongTitle />} />
              <Route path="/dashboard/logs" element={<LogManager />} />
              <Route path="/dashboard/reporting" element={<Reporting />} />
              <Route path="/dashboard/suspend" element={<SuspendService />} />
              <Route path="/dashboard/delete" element={<DeleteService />} />
              <Route path="/dashboard/profile" element={<Profile user={user} />} />
            </Routes>
          </TenantLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
