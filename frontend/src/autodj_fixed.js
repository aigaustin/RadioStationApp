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
    if (res && res.media) {
      if (res.media.length === 0) {
        listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);">No files in this folder</td></tr>';
        return;
      }
      
      listWrap.innerHTML = res.media.map(m => {
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
      listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load media</td></tr>';
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
    if (res && res.data) {
      const arr = Array.isArray(res) ? res : res.data;
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
      listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load playlists</td></tr>';
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
    
    if (res && res.data) {
      const arr = Array.isArray(res) ? res : res.data;
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
      listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load events</td></tr>';
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
